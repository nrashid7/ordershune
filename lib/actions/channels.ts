"use server";

import { revalidatePath } from "next/cache";
import { encryptSecret } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";

export async function saveChannelIntegration(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const channel = String(formData.get("channel") ?? "");
  const token = String(formData.get("access_token") ?? "");

  const { error } = await supabase.from("channel_integrations").upsert(
    {
      user_id: user.id,
      channel,
      page_id: String(formData.get("page_id") ?? "") || null,
      access_token_encrypted: encryptSecret(token) ?? (token || null),
      verify_token: String(formData.get("verify_token") ?? "") || null,
      is_active: formData.get("is_active") === "on",
    },
    { onConflict: "user_id,channel" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/settings/channels");
}
