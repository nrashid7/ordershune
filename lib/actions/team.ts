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

  await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  await supabase.from("profiles").update({ organization_id: org.id }).eq("id", user.id);

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

  const { error } = await supabase.from("organization_invites").upsert(
    {
      organization_id: organizationId,
      email: email.toLowerCase(),
      role: "member",
    },
    { onConflict: "organization_id,email" }
  );

  if (error) return { error: error.message };
  revalidatePath("/settings/team");
  return {
    success: true,
    message: `Invite saved for ${email}. They can join after signing up with that email.`,
  };
}
