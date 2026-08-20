-- Team invite tokens and org-scoped orders/customers

create extension if not exists pgcrypto with schema extensions;

alter table public.organization_invites
  add column if not exists token text unique default encode(extensions.gen_random_bytes(16), 'hex'),
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  add column if not exists invited_by uuid references auth.users (id) on delete set null,
  add column if not exists expires_at timestamptz not null default timezone('utc', now()) + interval '14 days';

alter table public.orders
  add column if not exists organization_id uuid references public.organizations (id) on delete set null;

alter table public.customers
  add column if not exists organization_id uuid references public.organizations (id) on delete set null;

create index if not exists orders_organization_id_idx on public.orders (organization_id);
create index if not exists customers_organization_id_idx on public.customers (organization_id);
create index if not exists organization_invites_token_idx on public.organization_invites (token);

create policy "Invited users view own invites"
  on public.organization_invites for select
  using (
    email = (select email from auth.users where id = auth.uid())
  );

create policy "Org members view org orders"
  on public.orders for select
  using (
    organization_id is not null and exists (
      select 1 from public.organization_members m
      where m.organization_id = orders.organization_id and m.user_id = auth.uid()
    )
  );

create policy "Org members insert org orders"
  on public.orders for insert
  with check (
    organization_id is not null and exists (
      select 1 from public.organization_members m
      where m.organization_id = orders.organization_id and m.user_id = auth.uid()
    )
  );

create policy "Org members update org orders"
  on public.orders for update
  using (
    organization_id is not null and exists (
      select 1 from public.organization_members m
      where m.organization_id = orders.organization_id and m.user_id = auth.uid()
    )
  );

create policy "Org members view org customers"
  on public.customers for select
  using (
    organization_id is not null and exists (
      select 1 from public.organization_members m
      where m.organization_id = customers.organization_id and m.user_id = auth.uid()
    )
  );

create policy "Org members insert org customers"
  on public.customers for insert
  with check (
    organization_id is not null and exists (
      select 1 from public.organization_members m
      where m.organization_id = customers.organization_id and m.user_id = auth.uid()
    )
  );

create policy "Org members update org customers"
  on public.customers for update
  using (
    organization_id is not null and exists (
      select 1 from public.organization_members m
      where m.organization_id = customers.organization_id and m.user_id = auth.uid()
    )
  );

create or replace function public.accept_pending_invites()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
begin
  for inv in
    select * from public.organization_invites
    where lower(email) = lower(new.email)
      and status = 'pending'
      and expires_at > timezone('utc', now())
  loop
    insert into public.organization_members (organization_id, user_id, role, invited_email)
    values (inv.organization_id, new.id, inv.role, inv.email)
    on conflict (organization_id, user_id) do nothing;

    update public.organization_invites
    set status = 'accepted'
    where id = inv.id;

    update public.profiles
    set organization_id = inv.organization_id
    where id = new.id and organization_id is null;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_auth_user_accept_invites on auth.users;
create trigger on_auth_user_accept_invites
after insert on auth.users
for each row execute function public.accept_pending_invites();
