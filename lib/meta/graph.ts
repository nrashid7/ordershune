import { logger } from "@/lib/logger";

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export async function sendMetaMessage(
  pageToken: string | null,
  recipientId: string,
  text: string
): Promise<{ success: boolean; mock: boolean }> {
  if (!pageToken) {
    logger.info("Meta mock send", { recipientId, textLength: text.length });
    return { success: true, mock: true };
  }

  const response = await fetch(`${GRAPH_BASE}/me/messages?access_token=${pageToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Meta send failed", { error, recipientId });
    return { success: false, mock: false };
  }

  return { success: true, mock: false };
}

export async function replyToComment(
  pageToken: string | null,
  commentId: string,
  text: string
): Promise<{ success: boolean; mock: boolean }> {
  if (!pageToken) {
    logger.info("Meta mock comment reply", { commentId, textLength: text.length });
    return { success: true, mock: true };
  }

  const response = await fetch(
    `${GRAPH_BASE}/${commentId}/comments?access_token=${pageToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    logger.error("Meta comment reply failed", { error, commentId });
    return { success: false, mock: false };
  }

  return { success: true, mock: false };
}

export async function sendPrivateReply(
  pageToken: string | null,
  commentId: string,
  text: string
): Promise<{ success: boolean; mock: boolean; messageId?: string }> {
  if (!pageToken) {
    logger.info("Meta mock private reply", { commentId, textLength: text.length });
    return { success: true, mock: true };
  }

  const response = await fetch(
    `${GRAPH_BASE}/${commentId}/private_replies?access_token=${pageToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    logger.error("Meta private reply failed", { error, commentId });
    return { success: false, mock: false };
  }

  const data = await response.json();
  return { success: true, mock: false, messageId: data.id as string | undefined };
}

export async function fetchAttachment(
  url: string,
  pageToken: string | null
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (!pageToken) {
    return { buffer: Buffer.from("mock-image"), mimeType: "image/jpeg" };
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${pageToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch attachment: ${response.status}`);
  }

  const mimeType = response.headers.get("content-type") ?? "application/octet-stream";
  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), mimeType };
}
