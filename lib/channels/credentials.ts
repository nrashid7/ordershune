import { decryptSecret } from "@/lib/crypto";
import { getEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export type ChannelName = "messenger" | "instagram";

export interface ChannelCredentials {
  userId: string;
  pageId: string;
  pageToken: string | null;
  verifyToken: string | null;
  captureComments: boolean;
  autoPrivateReply: boolean;
  commentReplyTemplate: string;
}

function envFallback(channel: ChannelName) {
  const env = getEnv();
  if (channel === "messenger") {
    return {
      verifyToken: env.MESSENGER_VERIFY_TOKEN ?? null,
      pageToken: env.MESSENGER_PAGE_ACCESS_TOKEN ?? null,
    };
  }
  return {
    verifyToken: env.INSTAGRAM_VERIFY_TOKEN ?? null,
    pageToken: env.INSTAGRAM_ACCESS_TOKEN ?? null,
  };
}

export async function resolveChannelCredentials(
  channel: ChannelName,
  pageId: string
): Promise<ChannelCredentials | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("channel_integrations")
    .select("*")
    .eq("channel", channel)
    .eq("page_id", pageId)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;

  const fallback = envFallback(channel);
  const pageToken =
    decryptSecret(data.access_token_encrypted) ?? fallback.pageToken;

  return {
    userId: data.user_id,
    pageId,
    pageToken,
    verifyToken: data.verify_token ?? fallback.verifyToken,
    captureComments: Boolean(
      (data as { capture_comments?: boolean }).capture_comments ?? true
    ),
    autoPrivateReply: Boolean(
      (data as { auto_private_reply?: boolean }).auto_private_reply ?? true
    ),
    commentReplyTemplate:
      (data as { comment_reply_template?: string | null }).comment_reply_template ??
      "ইনবক্স করুন 📩 We have sent you a message.",
  };
}

export async function findIntegrationByVerifyToken(
  channel: ChannelName,
  token: string
): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("channel_integrations")
    .select("id")
    .eq("channel", channel)
    .eq("verify_token", token)
    .eq("is_active", true)
    .maybeSingle();

  return Boolean(data);
}

export function getMetaAppSecret(): string | null {
  const env = getEnv();
  return env.META_APP_SECRET ?? env.WHATSAPP_APP_SECRET ?? null;
}
