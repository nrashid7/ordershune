-- OrderShune initial schema

create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  shop_name text,
  phone text unique,
  default_pickup_address text,
  preferred_courier text,
  default_payment_method text,
  product_category text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  customer_name text,
  customer_phone text,
  customer_address text,
  delivery_area text,
  product_name text,
  quantity integer,
  variant text,
  price numeric,
  cod_amount numeric,
  payment_status text,
  delivery_note text,
  raw_input text,
  input_type text,
  extracted_json jsonb,
  missing_fields text[] default '{}',
  confidence_score numeric,
  status text not null default 'pending',
  courier_name text,
  courier_status text,
  courier_tracking_id text,
  courier_payload jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.courier_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  courier_name text not null,
  api_key text,
  api_secret text,
  merchant_id text,
  pickup_address text,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, courier_name)
);

create table if not exists public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  whatsapp_phone text not null unique,
  last_message text,
  last_order_id uuid references public.orders (id) on delete set null,
  state text not null default 'idle',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists orders_user_status_created_idx
  on public.orders (user_id, status, created_at desc);

create index if not exists whatsapp_sessions_phone_idx
  on public.whatsapp_sessions (whatsapp_phone);

create index if not exists profiles_phone_idx
  on public.profiles (phone);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

create trigger orders_updated_at
before update on public.orders
for each row execute function public.handle_updated_at();

create trigger courier_integrations_updated_at
before update on public.courier_integrations
for each row execute function public.handle_updated_at();

create trigger whatsapp_sessions_updated_at
before update on public.whatsapp_sessions
for each row execute function public.handle_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.courier_integrations enable row level security;
alter table public.whatsapp_sessions enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own orders"
  on public.orders for delete
  using (auth.uid() = user_id);

create policy "Users can view own courier integrations"
  on public.courier_integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert own courier integrations"
  on public.courier_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own courier integrations"
  on public.courier_integrations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own courier integrations"
  on public.courier_integrations for delete
  using (auth.uid() = user_id);

create policy "Users can view own whatsapp sessions"
  on public.whatsapp_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own whatsapp sessions"
  on public.whatsapp_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own whatsapp sessions"
  on public.whatsapp_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own whatsapp sessions"
  on public.whatsapp_sessions for delete
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('order_uploads', 'order_uploads', false)
on conflict (id) do nothing;

create policy "Users can upload own files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'order_uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'order_uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'order_uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'order_uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'order_uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
