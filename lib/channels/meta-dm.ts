import { extractTextFromImage } from "@/lib/ocr";
import { transcribeAudio } from "@/lib/speech";
import {
  formatMissingFieldsPrompt,
  generateCustomerConfirmation,
} from "@/lib/formatting";
import { fetchAttachment, sendMetaMessage } from "@/lib/meta/graph";
import type { ChannelName } from "@/lib/channels/credentials";
import {
  findOpenDraftOrder,
  ingestMessage,
  logChannelMessage,
  mergeIntoDraft,
  upsertConversation,
} from "@/lib/channels/pipeline";
import type { InputType } from "@/lib/types/order";

interface MetaAttachment {
  type?: string;
  payload?: { url?: string };
}

interface MetaMessage {
  mid?: string;
  text?: string;
  is_echo?: boolean;
  attachments?: MetaAttachment[];
}

interface MetaMessagingEvent {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: MetaMessage;
  delivery?: unknown;
  read?: unknown;
}

export interface MetaWebhookEntry {
  id?: string;
  messaging?: MetaMessagingEvent[];
  changes?: unknown[];
}

function buyerReply(order: {
  missing_fields?: string[] | null;
  customer_name?: string | null;
  product_name?: string | null;
  quantity?: number | null;
  cod_amount?: number | null;
  price?: number | null;
  payment_status?: string | null;
  customer_address?: string | null;
  delivery_area?: string | null;
}): string {
  if (order.missing_fields && order.missing_fields.length > 0) {
    return formatMissingFieldsPrompt(order.missing_fields);
  }
  return generateCustomerConfirmation(order);
}

async function resolveInputFromMessage(
  message: MetaMessage,
  pageToken: string | null
): Promise<{ inputType: InputType; text: string } | null> {
  if (message.text?.trim()) {
    return { inputType: "text", text: message.text.trim() };
  }

  const attachment = message.attachments?.[0];
  if (!attachment?.payload?.url) return null;

  const { buffer, mimeType } = await fetchAttachment(
    attachment.payload.url,
    pageToken
  );

  if (attachment.type === "image") {
    const ocrText = await extractTextFromImage(buffer, mimeType);
    return { inputType: "image_ocr_text", text: ocrText };
  }

  if (attachment.type === "audio" || attachment.type === "video") {
    const transcript = await transcribeAudio(buffer, mimeType);
    return { inputType: "audio_transcript", text: transcript };
  }

  return null;
}

export async function handleMetaDmWebhook(
  channel: ChannelName,
  entries: MetaWebhookEntry[]
) {
  const { resolveChannelCredentials } = await import("@/lib/channels/credentials");
  const { createAdminClient } = await import("@/lib/supabase/admin");

  for (const entry of entries) {
    const pageId = entry.id ?? "";
    const creds = await resolveChannelCredentials(channel, pageId);
    if (!creds) continue;

    for (const event of entry.messaging ?? []) {
      if (event.delivery || event.read) continue;

      const message = event.message;
      if (!message || message.is_echo) continue;

      const senderId = event.sender?.id;
      if (!senderId) continue;

      const input = await resolveInputFromMessage(message, creds.pageToken);
      if (!input) continue;

      await logChannelMessage({
        userId: creds.userId,
        channel,
        direction: "inbound",
        senderId,
        messageText: input.text,
        messageType: message.attachments?.[0]?.type ?? "text",
        rawPayload: event,
      });

      const { data: existingConv } = await createAdminClient()
        .from("channel_conversations")
        .select("id, last_order_id")
        .eq("channel", channel)
        .eq("page_id", pageId)
        .eq("sender_id", senderId)
        .maybeSingle();

      const openDraft = await findOpenDraftOrder(
        creds.userId,
        existingConv?.last_order_id ?? null
      );

      const order = openDraft
        ? await mergeIntoDraft(openDraft.id, creds.userId, input.inputType, input.text)
        : await ingestMessage(creds.userId, input.inputType, input.text);

      const conversationId = await upsertConversation({
        userId: creds.userId,
        channel,
        pageId,
        senderId,
        lastMessage: input.text,
        lastOrderId: order.id,
        state: order.missing_fields?.length ? "draft" : "confirmed",
      });

      const reply = buyerReply(order);
      await sendMetaMessage(creds.pageToken, senderId, reply);

      await logChannelMessage({
        userId: creds.userId,
        conversationId,
        channel,
        direction: "outbound",
        senderId,
        messageText: reply,
        messageType: "text",
        orderId: order.id,
      });
    }
  }
}

export function parseMetaDmEntries(body: unknown): MetaWebhookEntry[] {
  const payload = body as { entry?: MetaWebhookEntry[] };
  return payload.entry ?? [];
}
