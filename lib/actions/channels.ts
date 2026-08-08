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

  const { data: existing } = await supabase
    .from("channel_integrations")
    .select("access_token_encrypted")
    .eq("user_id", user.id)
    .eq("channel", channel)
    .maybeSingle();

  const { error } = await supabase.from("channel_integrations").upsert(
    {
      user_id: user.id,
      channel,
      page_id: String(formData.get("page_id") ?? "") || null,
      access_token_encrypted: token
        ? encryptSecret(token)
        : existing?.access_token_encrypted ?? null,
      verify_token: String(formData.get("verify_token") ?? "") || null,
      is_active: formData.get("is_active") === "on",
      capture_comments: formData.get("capture_comments") === "on",
      auto_private_reply: formData.get("auto_private_reply") === "on",
      comment_reply_template:
        String(formData.get("comment_reply_template") ?? "") ||
        "ইনবক্স করুন 📩 We have sent you a message.",
    },
    { onConflict: "user_id,channel" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/settings/channels");
}
