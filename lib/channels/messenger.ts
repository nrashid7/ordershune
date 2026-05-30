import { extractOrder } from "@/lib/ai/extract-order";
import { deriveOrderStatus, formatWhatsAppOrderReply } from "@/lib/formatting";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

async function findUserByPageId(pageId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("channel_integrations")
    .select("user_id")
    .eq("channel", "messenger")
    .eq("page_id", pageId)
    .eq("is_active", true)
    .maybeSingle();
  return data?.user_id ?? null;
}

export async function handleMessengerWebhook(body: unknown) {
  const payload = body as {
    object?: string;
    entry?: Array<{
      id?: string;
      messaging?: Array<{
        sender?: { id?: string };
        message?: { text?: string };
      }>;
    }>;
  };

  if (payload.object !== "page") return;

  for (const entry of payload.entry ?? []) {
    const pageId = entry.id ?? "";
    const userId = await findUserByPageId(pageId);
    if (!userId) continue;

    for (const event of entry.messaging ?? []) {
      const text = event.message?.text;
      if (!text) continue;

      const extracted = await extractOrder(text, "text");
      const status = deriveOrderStatus(extracted);
      const admin = createAdminClient();

      const { data: order } = await admin
        .from("orders")
        .insert({
          user_id: userId,
          raw_input: text,
          input_type: "text",
          extracted_json: extracted,
          missing_fields: extracted.missing_fields,
          confidence_score: extracted.confidence_score,
          status,
          customer_name: extracted.customer_name,
          customer_phone: extracted.customer_phone,
          customer_address: extracted.customer_address,
          delivery_area: extracted.delivery_area,
          product_name: extracted.product_name,
          quantity: extracted.quantity,
          variant: extracted.variant,
          price: extracted.price,
          cod_amount: extracted.cod_amount,
          payment_status: extracted.payment_status,
          delivery_note: extracted.delivery_note,
        })
        .select("id")
        .single();

      const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
      const senderId = event.sender?.id;
      if (token && senderId) {
        await fetch(
          `https://graph.facebook.com/v19.0/me/messages?access_token=${token}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: senderId },
              message: {
                text: formatWhatsAppOrderReply(extracted) + `\n\nOrder ID: ${order?.id ?? "—"}`,
              },
            }),
          }
        );
      } else {
        logger.info("Messenger mock reply", { orderId: order?.id });
      }
    }
  }
}
