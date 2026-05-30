import type { SupabaseClient } from "@supabase/supabase-js";

export async function createNotification(
  supabase: SupabaseClient,
  params: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    orderId?: string;
  }
) {
  await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    order_id: params.orderId ?? null,
  });
}
