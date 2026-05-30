import { logger } from "@/lib/logger";

export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<{ success: boolean; mock: boolean }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    logger.info("WhatsApp mock send", { to, textLength: text.length });
    return { success: true, mock: true };
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    logger.error("WhatsApp send failed", { error });
    return { success: false, mock: false };
  }

  return { success: true, mock: false };
}

export async function downloadWhatsAppMedia(mediaId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    return {
      buffer: Buffer.from("mock-image"),
      mimeType: "image/jpeg",
    };
  }

  const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meta = await metaRes.json();
  const url = meta.url as string;
  const mimeType = (meta.mime_type as string) ?? "application/octet-stream";

  const fileRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const arrayBuffer = await fileRes.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), mimeType };
}
