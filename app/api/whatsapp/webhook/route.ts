import { NextResponse } from "next/server";
import { getEnv, hasWhatsAppSignatureVerification, isProduction } from "@/lib/env";
import { logger } from "@/lib/logger";
import { handleWhatsAppWebhook } from "@/lib/whatsapp/handler";
import { verifyWhatsAppSignature } from "@/lib/whatsapp/signature";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = getEnv().WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const { getClientIp, rateLimit } = await import("@/lib/rate-limit");
    const ip = getClientIp(request);
    const limited = rateLimit(`whatsapp:${ip}`, 200, 60_000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const rawBody = await request.text();
    const appSecret = getEnv().WHATSAPP_APP_SECRET;

    if (isProduction() && !hasWhatsAppSignatureVerification()) {
      logger.warn("WhatsApp webhook signature verification is disabled");
    }

    if (isProduction() && hasWhatsAppSignatureVerification()) {
      const signature = request.headers.get("x-hub-signature-256");
      if (!verifyWhatsAppSignature(rawBody, signature, appSecret!)) {
        logger.warn("WhatsApp webhook rejected: invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = rawBody ? JSON.parse(rawBody) : {};
    await handleWhatsAppWebhook(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("WhatsApp webhook processing failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
