-- Channel conversations and message log for Meta DMs and comments

create table if not exists public.channel_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null check (channel in ('messenger', 'instagram')),
  page_id text not null,
  sender_id text not null,
  sender_name text,
  last_order_id uuid references public.orders (id) on delete set null,
  last_message text,
  state text not null default 'idle',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (channel, page_id, sender_id)
);

create index if not exists channel_conversations_user_idx
  on public.channel_conversations (user_id, updated_at desc);

create trigger channel_conversations_updated_at
before update on public.channel_conversations
for each row execute function public.handle_updated_at();

create table if not exists public.channel_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid references public.channel_conversations (id) on delete set null,
  channel text not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender_id text,
  message_text text,
  message_type text not null default 'text',
  comment_id text,
  post_id text,
  order_id uuid references public.orders (id) on delete set null,
  raw_payload jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists channel_messages_user_created_idx
  on public.channel_messages (user_id, created_at desc);

create index if not exists channel_messages_conversation_idx
  on public.channel_messages (conversation_id, created_at desc);

alter table public.channel_integrations
  add column if not exists capture_comments boolean not null default true,
  add column if not exists auto_private_reply boolean not null default true,
  add column if not exists comment_reply_template text default 'ইনবক্স করুন 📩 We have sent you a message.';

alter table public.channel_conversations enable row level security;
alter table public.channel_messages enable row level security;

create policy "Users manage own channel conversations"
  on public.channel_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own channel messages"
  on public.channel_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
