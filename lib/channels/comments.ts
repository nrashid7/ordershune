import { extractOrder } from "@/lib/ai/extract-order";
import { replyToComment, sendPrivateReply } from "@/lib/meta/graph";
import type { ChannelCredentials, ChannelName } from "@/lib/channels/credentials";
import {
  ingestMessage,
  logChannelMessage,
  upsertConversation,
} from "@/lib/channels/pipeline";
import type { ExtractedOrder } from "@/lib/types/order";

const PHONE_RE = /(?:\+?88)?01[3-9]\d{8}/;
const QTY_RE = /\b(\d+)\s*(?:ta|pcs|piece|pc|টি)\b/i;

export function shouldCaptureComment(extracted: ExtractedOrder, text: string): boolean {
  if (extracted.customer_phone || PHONE_RE.test(text)) return true;
  if (extracted.product_name) return true;
  if (extracted.quantity != null && extracted.quantity > 0) return true;
  if (QTY_RE.test(text)) return true;
  if (extracted.cod_amount != null && extracted.cod_amount > 0) return true;
  return false;
}

export interface FeedChange {
  field?: string;
  value?: {
    item?: string;
    verb?: string;
    comment_id?: string;
    post_id?: string;
    parent_id?: string;
    id?: string;
    media?: { id?: string };
    message?: string;
    text?: string;
    from?: { id?: string; name?: string; username?: string };
  };
}

/** Resolve Facebook vs Instagram comment/post IDs from a webhook change value. */
export function resolveCommentIds(value: FeedChange["value"]) {
  return {
    commentId: value?.comment_id ?? value?.id ?? value?.parent_id ?? null,
    postId: value?.post_id ?? value?.media?.id ?? null,
    senderId: value?.from?.id ?? null,
    text: (value?.message ?? value?.text ?? "").trim(),
  };
}

export async function handleCommentChanges(
  channel: ChannelName,
  pageId: string,
  creds: ChannelCredentials,
  changes: FeedChange[]
) {
  if (!creds.captureComments) return;

  for (const change of changes) {
    const isFbComment =
      channel === "messenger" &&
      change.field === "feed" &&
      change.value?.item === "comment" &&
      change.value?.verb === "add";

    const isIgComment =
      channel === "instagram" && change.field === "comments";

    if (!isFbComment && !isIgComment) continue;

    const value = change.value ?? {};
    const { commentId, postId, senderId, text } = resolveCommentIds(value);

    if (!commentId || !senderId || !text) continue;
    if (senderId === pageId) continue;

    await logChannelMessage({
      userId: creds.userId,
      channel,
      direction: "inbound",
      senderId,
      messageText: text,
      messageType: "comment",
      commentId,
      postId: postId ?? null,
      rawPayload: change,
    });

    const extracted = await extractOrder(text, "text");
    if (!shouldCaptureComment(extracted, text)) continue;

    const order = await ingestMessage(creds.userId, "text", text);

    const conversationId = await upsertConversation({
      userId: creds.userId,
      channel,
      pageId,
      senderId,
      senderName: value.from?.name ?? value.from?.username ?? null,
      lastMessage: text,
      lastOrderId: order.id,
      state: "draft",
    });

    await logChannelMessage({
      userId: creds.userId,
      conversationId,
      channel,
      direction: "inbound",
      senderId,
      messageText: text,
      messageType: "comment",
      commentId,
      postId: postId ?? null,
      orderId: order.id,
      rawPayload: change,
    });

    const publicReply = creds.commentReplyTemplate;
    await replyToComment(creds.pageToken, commentId, publicReply);

    await logChannelMessage({
      userId: creds.userId,
      conversationId,
      channel,
      direction: "outbound",
      senderId,
      messageText: publicReply,
      messageType: "comment_reply",
      commentId,
      orderId: order.id,
    });

    if (creds.autoPrivateReply) {
      const privateText =
        "Thanks for your interest! Please share your full name, phone number, and delivery address here so we can confirm your order.";
      await sendPrivateReply(creds.pageToken, commentId, privateText);

      await logChannelMessage({
        userId: creds.userId,
        conversationId,
        channel,
        direction: "outbound",
        senderId,
        messageText: privateText,
        messageType: "private_reply",
        commentId,
        orderId: order.id,
      });
    }
  }
}

export function parseCommentChanges(entry: {
  id?: string;
  changes?: FeedChange[];
}): FeedChange[] {
  return entry.changes ?? [];
}
