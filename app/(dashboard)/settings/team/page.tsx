import { TeamClient } from "@/components/settings/team-client";
import { createClient } from "@/lib/supabase/server";

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user!.id)
    .maybeSingle();

  const { data: invites } = org
    ? await supabase
        .from("organization_invites")
        .select("email, role")
        .eq("organization_id", org.id)
    : { data: [] };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-muted-foreground">Invite staff to help manage orders</p>
      </div>
      <TeamClient organization={org} invites={invites ?? []} />
    </div>
  );
}
