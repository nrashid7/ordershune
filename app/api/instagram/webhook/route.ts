import { NextResponse } from "next/server";
import {
  findIntegrationByVerifyToken,
  getMetaAppSecret,
} from "@/lib/channels/credentials";
import { handleInstagramWebhook } from "@/lib/channels/instagram";
import { getEnv, isProduction } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyMetaSignature } from "@/lib/meta/signature";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const envToken = getEnv().INSTAGRAM_VERIFY_TOKEN;

  const tenantMatch = token
    ? await findIntegrationByVerifyToken("instagram", token)
    : false;

  if (
    mode === "subscribe" &&
    challenge &&
    token &&
    (token === envToken || tenantMatch)
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`instagram:${ip}`, 120, 60_000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const rawBody = await request.text();
    const appSecret = getMetaAppSecret();

    if (isProduction() && !appSecret) {
      logger.warn("Instagram webhook signature verification is disabled");
    }

    if (isProduction() && appSecret) {
      const signature = request.headers.get("x-hub-signature-256");
      if (!verifyMetaSignature(rawBody, signature, appSecret)) {
        logger.warn("Instagram webhook rejected: invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = rawBody ? JSON.parse(rawBody) : {};
    await handleInstagramWebhook(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Instagram webhook processing failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
