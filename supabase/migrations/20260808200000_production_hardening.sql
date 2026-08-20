-- Production hardening: invite accept RPC, invite RLS via JWT email,
-- unique active channel page_id for reliable webhook routing.

create or replace function public.accept_team_invite(invite_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.organization_invites%rowtype;
  uid uuid := auth.uid();
  user_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if uid is null then
    return jsonb_build_object('error', 'Not authenticated');
  end if;

  if invite_token is null or length(trim(invite_token)) = 0 then
    return jsonb_build_object('error', 'Invite token required');
  end if;

  select * into inv
  from public.organization_invites
  where token = invite_token
    and status = 'pending'
  limit 1;

  if not found then
    return jsonb_build_object('error', 'Invite not found or expired');
  end if;

  if inv.expires_at < timezone('utc', now()) then
    update public.organization_invites
    set status = 'expired'
    where id = inv.id;
    return jsonb_build_object('error', 'Invite has expired');
  end if;

  if lower(inv.email) <> user_email then
    return jsonb_build_object('error', 'This invite was sent to a different email address');
  end if;

  insert into public.organization_members (organization_id, user_id, role, invited_email)
  values (inv.organization_id, uid, inv.role, inv.email)
  on conflict (organization_id, user_id) do update
    set role = excluded.role,
        invited_email = excluded.invited_email;

  update public.organization_invites
  set status = 'accepted'
  where id = inv.id;

  update public.profiles
  set organization_id = inv.organization_id
  where id = uid;

  return jsonb_build_object(
    'success', true,
    'organizationId', inv.organization_id
  );
end;
$$;

revoke all on function public.accept_team_invite(text) from public;
grant execute on function public.accept_team_invite(text) to authenticated;

drop policy if exists "Invited users view own invites" on public.organization_invites;

create policy "Invited users view own invites"
  on public.organization_invites for select
  using (
    status = 'pending'
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create unique index if not exists channel_integrations_active_page_uidx
  on public.channel_integrations (channel, page_id)
  where is_active = true
    and page_id is not null
    and length(trim(page_id)) > 0;
