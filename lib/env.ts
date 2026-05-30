import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1).optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
  WHATSAPP_APP_SECRET: z.string().min(1).optional(),
  OCR_PROVIDER: z.enum(["mock", "ocrspace", "google"]).default("mock"),
  PATHAO_USERNAME: z.string().min(1).optional(),
  PATHAO_PASSWORD: z.string().min(1).optional(),
  CREDENTIALS_ENCRYPTION_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_STARTER: z.string().min(1).optional(),
  STRIPE_PRICE_PRO: z.string().min(1).optional(),
  MESSENGER_VERIFY_TOKEN: z.string().min(1).optional(),
  MESSENGER_PAGE_ACCESS_TOKEN: z.string().min(1).optional(),
  INSTAGRAM_VERIFY_TOKEN: z.string().min(1).optional(),
  INSTAGRAM_ACCESS_TOKEN: z.string().min(1).optional(),
  SENTRY_DSN: z.string().url().optional(),
  OCR_API_KEY: z.string().min(1).optional(),
  SPEECH_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  SPEECH_API_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cachedEnv: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${missing}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function validateEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    return;
  }

  getEnv();
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function hasWhatsAppCredentials() {
  const env = getEnv();
  return Boolean(
    env.WHATSAPP_ACCESS_TOKEN &&
      env.WHATSAPP_PHONE_NUMBER_ID &&
      env.WHATSAPP_VERIFY_TOKEN
  );
}

export function hasWhatsAppSignatureVerification() {
  return Boolean(getEnv().WHATSAPP_APP_SECRET);
}
