-- Launch features: customers, teams, billing, COD, notifications, channels

-- Organizations & team members
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  invited_email text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, email)
);

alter table public.organization_invites enable row level security;

create policy "Org owners manage invites"
  on public.organization_invites for all
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_invites.organization_id and o.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_invites.organization_id and o.owner_id = auth.uid()
    )
  );

-- Subscriptions (Stripe-ready)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  status text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  orders_limit integer not null default 50,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Repeat customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  phone text not null,
  name text,
  address text,
  delivery_area text,
  order_count integer not null default 0,
  total_cod numeric not null default 0,
  last_order_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, phone)
);

-- COD reconciliation
create table if not exists public.cod_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade unique,
  cod_amount numeric not null,
  collected_amount numeric,
  status text not null default 'pending' check (status in ('pending', 'collected', 'reconciled', 'disputed')),
  collected_at timestamptz,
  reconciled_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- In-app notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'info',
  title text not null,
  body text,
  order_id uuid references public.orders (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

-- Messenger / Instagram channel integrations
create table if not exists public.channel_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null check (channel in ('messenger', 'instagram')),
  page_id text,
  access_token_encrypted text,
  verify_token text,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, channel)
);

-- Profile extensions
alter table public.profiles
  add column if not exists organization_id uuid references public.organizations (id) on delete set null;

alter table public.orders
  add column if not exists customer_id uuid references public.customers (id) on delete set null,
  add column if not exists delivered_at timestamptz,
  add column if not exists cod_entry_id uuid references public.cod_entries (id) on delete set null;

-- Encrypted courier credentials (plaintext columns kept for migration; app writes encrypted only)
alter table public.courier_integrations
  add column if not exists api_key_encrypted text,
  add column if not exists api_secret_encrypted text;

create index if not exists customers_user_phone_idx on public.customers (user_id, phone);
create index if not exists cod_entries_user_status_idx on public.cod_entries (user_id, status);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, created_at desc);
create index if not exists orders_customer_id_idx on public.orders (customer_id);

create trigger organizations_updated_at
before update on public.organizations
for each row execute function public.handle_updated_at();

create trigger subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.handle_updated_at();

create trigger customers_updated_at
before update on public.customers
for each row execute function public.handle_updated_at();

create trigger cod_entries_updated_at
before update on public.cod_entries
for each row execute function public.handle_updated_at();

create trigger channel_integrations_updated_at
before update on public.channel_integrations
for each row execute function public.handle_updated_at();

-- Auto-create subscription on signup
create or replace function public.handle_new_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, plan, status, orders_limit)
  values (new.id, 'free', 'active', 50)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_subscription on auth.users;
create trigger on_auth_user_subscription
after insert on auth.users
for each row execute function public.handle_new_subscription();

-- RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.customers enable row level security;
alter table public.cod_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.channel_integrations enable row level security;

create policy "Users manage own organizations"
  on public.organizations for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Members view organizations they belong to"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organizations.id and m.user_id = auth.uid()
    )
  );

create policy "Users manage org membership"
  on public.organization_members for all
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id and o.owner_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id and o.owner_id = auth.uid()
    )
  );

create policy "Users view own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "Users update own subscription"
  on public.subscriptions for update using (auth.uid() = user_id);

create policy "Users manage own customers"
  on public.customers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own cod entries"
  on public.cod_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own channel integrations"
  on public.channel_integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
