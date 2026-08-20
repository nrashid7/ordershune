import {
  formatWhatsAppOrderReply,
  normalizePhone,
} from "@/lib/formatting";
import { extractTextFromImage } from "@/lib/ocr";
import { transcribeAudio } from "@/lib/speech";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadWhatsAppMedia, sendWhatsAppMessage } from "./client";
import { handleCommand } from "./commands";
import { ingestMessage } from "@/lib/channels/pipeline";

interface WhatsAppMessage {
  from: string;
  type: "text" | "image" | "audio" | "unknown";
  text?: string;
  mediaId?: string;
}

function parseIncomingMessage(body: unknown): WhatsAppMessage[] {
  const payload = body as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<{
            from: string;
            type: string;
            text?: { body?: string };
            image?: { id?: string };
            audio?: { id?: string };
          }>;
        };
      }>;
    }>;
  };

  const messages = payload.entry?.[0]?.changes?.[0]?.value?.messages ?? [];
  return messages.map((message) => ({
    from: message.from,
    type:
      message.type === "text" || message.type === "image" || message.type === "audio"
        ? message.type
        : "unknown",
    text: message.text?.body,
    mediaId: message.image?.id ?? message.audio?.id,
  }));
}

async function findSellerUserId(phone: string) {
  const admin = createAdminClient();
  const normalized = normalizePhone(phone);

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .or(`phone.eq.${normalized},phone.eq.${phone},phone.eq.0${normalized.slice(2)}`)
    .maybeSingle();

  if (profile?.id) return profile.id;

  const { data: session } = await admin
    .from("whatsapp_sessions")
    .select("user_id")
    .eq("whatsapp_phone", normalized)
    .maybeSingle();

  return session?.user_id ?? null;
}

async function saveWhatsAppSession(
  userId: string,
  phone: string,
  lastMessage: string,
  orderId: string
) {
  const admin = createAdminClient();
  await admin.from("whatsapp_sessions").upsert(
    {
      user_id: userId,
      whatsapp_phone: normalizePhone(phone),
      last_message: lastMessage.slice(0, 500),
      last_order_id: orderId,
      state: "draft",
    },
    { onConflict: "whatsapp_phone" }
  );
}

export async function handleWhatsAppWebhook(body: unknown) {
  const messages = parseIncomingMessage(body);

  for (const message of messages) {
    const userId = await findSellerUserId(message.from);

    if (!userId) {
      await sendWhatsAppMessage(
        message.from,
        "OrderShune: Phone not registered. Sign up at OrderShune and add your WhatsApp number in onboarding."
      );
      continue;
    }

    const admin = createAdminClient();

    if (message.type === "text" && message.text) {
      const text = message.text.trim();
      const lower = text.toLowerCase();

      if (
        ["confirm", "1", "2", "3", "4", "format", "orders", "help", "cancel", "edit"].includes(
          lower
        )
      ) {
        const { data: session } = await admin
          .from("whatsapp_sessions")
          .select("*")
          .eq("whatsapp_phone", normalizePhone(message.from))
          .maybeSingle();

        const reply = await handleCommand(text, {
          phone: message.from,
          userId,
          lastOrderId: session?.last_order_id,
          getOrder: async (id) => {
            const { data } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
            return data;
          },
          confirmOrder: async (id) => {
            const { data: order } = await admin
              .from("orders")
              .select("missing_fields")
              .eq("id", id)
              .single();
            const status =
              order?.missing_fields && order.missing_fields.length > 0
                ? "missing_info"
                : "ready_for_courier";
            await admin.from("orders").update({ status }).eq("id", id);
            await admin
              .from("whatsapp_sessions")
              .update({ state: "idle" })
              .eq("whatsapp_phone", normalizePhone(message.from));
          },
          cancelDraft: async () => {
            if (session?.last_order_id) {
              await admin.from("orders").delete().eq("id", session.last_order_id);
            }
            await admin
              .from("whatsapp_sessions")
              .update({ state: "idle", last_order_id: null })
              .eq("whatsapp_phone", normalizePhone(message.from));
          },
          listOrders: async () => {
            const { data } = await admin
              .from("orders")
              .select("customer_name, product_name, status")
              .eq("user_id", userId)
              .order("created_at", { ascending: false })
              .limit(5);
            return data ?? [];
          },
          getProfile: async () => {
            const { data } = await admin
              .from("profiles")
              .select("default_pickup_address")
              .eq("id", userId)
              .maybeSingle();
            return data;
          },
        });

        await sendWhatsAppMessage(message.from, reply);
        continue;
      }

      const order = await ingestMessage(userId, "text", text);
      await saveWhatsAppSession(userId, message.from, text, order.id);
      await sendWhatsAppMessage(message.from, formatWhatsAppOrderReply(order));
      continue;
    }

    if (message.type === "image" && message.mediaId) {
      const media = await downloadWhatsAppMedia(message.mediaId);
      const ocrText = await extractTextFromImage(media.buffer, media.mimeType);
      const order = await ingestMessage(userId, "image_ocr_text", ocrText);
      await saveWhatsAppSession(userId, message.from, ocrText, order.id);
      await sendWhatsAppMessage(message.from, formatWhatsAppOrderReply(order));
      continue;
    }

    if (message.type === "audio" && message.mediaId) {
      const media = await downloadWhatsAppMedia(message.mediaId);
      const transcript = await transcribeAudio(media.buffer, media.mimeType);
      const order = await ingestMessage(userId, "audio_transcript", transcript);
      await saveWhatsAppSession(userId, message.from, transcript, order.id);
      await sendWhatsAppMessage(message.from, formatWhatsAppOrderReply(order));
      continue;
    }

    await sendWhatsAppMessage(
      message.from,
      "Unsupported message type. Send text, image, or voice note."
    );
  }
}
