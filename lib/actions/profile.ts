"use server";

import { revalidatePath } from "next/cache";
import { normalizePhone } from "@/lib/formatting";
import { createClient } from "@/lib/supabase/server";
import { type ActionState } from "@/lib/actions/auth";

export type { ActionState };

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const phone = normalizePhone(String(formData.get("phone") ?? ""));

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? ""),
      shop_name: String(formData.get("shop_name") ?? ""),
      phone,
      default_pickup_address: String(formData.get("default_pickup_address") ?? ""),
      preferred_courier: String(formData.get("preferred_courier") ?? "pathao"),
      default_payment_method: String(formData.get("default_payment_method") ?? "cod"),
      product_category: String(formData.get("product_category") ?? ""),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await supabase.from("whatsapp_sessions").upsert(
    { user_id: user.id, whatsapp_phone: phone, state: "idle" },
    { onConflict: "whatsapp_phone" }
  );

  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");
  return { success: "Profile updated" };
}
