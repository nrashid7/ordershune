import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Profile settings</h1>
        <p className="text-sm text-muted-foreground">
          Update shop details and WhatsApp phone used for bot matching
        </p>
      </div>
      <ProfileSettingsForm profile={profile} />
    </div>
  );
}
