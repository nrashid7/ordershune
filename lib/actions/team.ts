"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createOrganization(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({ owner_id: user.id, name })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) return { error: memberError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ organization_id: org.id })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/settings/team");
  return { success: true, id: org.id };
}

export async function inviteTeamMember(email: string, organizationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!org) return { error: "Only the owner can invite members" };

  const { data: invite, error } = await supabase
    .from("organization_invites")
    .upsert(
      {
        organization_id: organizationId,
        email: email.toLowerCase(),
        role: "member",
        status: "pending",
        invited_by: user.id,
      },
      { onConflict: "organization_id,email" }
    )
    .select("token")
    .single();

  if (error) return { error: error.message };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${baseUrl}/invite/${invite.token}`;

  revalidatePath("/settings/team");
  return {
    success: true,
    inviteUrl,
    message: `Invite link created for ${email}`,
  };
}

export async function acceptInvite(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // SECURITY DEFINER RPC — invitee cannot reliably SELECT/UPDATE invites under RLS.
  const { data, error } = await supabase.rpc("accept_team_invite", {
    invite_token: token,
  });

  if (error) return { error: error.message };

  const result = data as
    | { success?: boolean; organizationId?: string; error?: string }
    | null;

  if (!result || result.error) {
    return { error: result?.error ?? "Invite not found or expired" };
  }

  revalidatePath("/settings/team");
  return { success: true, organizationId: result.organizationId };
}

export async function revokeInvite(inviteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: invite } = await supabase
    .from("organization_invites")
    .select("organization_id")
    .eq("id", inviteId)
    .maybeSingle();

  if (!invite) return { error: "Invite not found" };

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", invite.organization_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!org) return { error: "Only the owner can revoke invites" };

  const { error } = await supabase
    .from("organization_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId);

  if (error) return { error: error.message };
  revalidatePath("/settings/team");
  return { success: true };
}
