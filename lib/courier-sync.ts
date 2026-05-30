import { getCourierAdapter } from "@/lib/couriers";
import { resolveCourierConfig } from "@/lib/courier-config";
import { createNotification } from "@/lib/notifications";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function syncOrderCourierStatus(
  supabase: SupabaseClient,
  order: {
    id: string;
    user_id: string;
    courier_name: string | null;
    courier_tracking_id: string | null;
    status: string;
    customer_phone: string | null;
  },
  integration: Parameters<typeof resolveCourierConfig>[0]
) {
  if (!order.courier_name || !order.courier_tracking_id) {
    return { updated: false, reason: "no_tracking" };
  }

  const adapter = getCourierAdapter(order.courier_name);
  if (!adapter) return { updated: false, reason: "unsupported_courier" };

  const config = resolveCourierConfig(integration);
  const result = await adapter.getStatus(order.courier_tracking_id, config);

  const updates: Record<string, unknown> = {
    courier_status: result.status,
  };

  let notify = false;

  if (result.status === "delivered" && order.status !== "completed") {
    updates.status = "completed";
    updates.delivered_at = new Date().toISOString();
    notify = true;
  }

  await supabase.from("orders").update(updates).eq("id", order.id);

  if (notify) {
    await createNotification(supabase, {
      userId: order.user_id,
      type: "delivery",
      title: "Order delivered",
      body: `Tracking ${order.courier_tracking_id} marked delivered.`,
      orderId: order.id,
    });

    const { data: profile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", order.user_id)
      .maybeSingle();

    if (profile?.phone) {
      await sendWhatsAppMessage(
        profile.phone,
        `✅ Order delivered\nTracking: ${order.courier_tracking_id}\nView: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`
      );
    }
  }

  return { updated: true, status: result.status, notify };
}
