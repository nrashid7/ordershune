import { NextResponse } from "next/server";
import { allowMockProviders, getEnv, isProduction } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

type CheckStatus = "ok" | "error" | "warn" | "skipped";

export async function GET() {
  const checks: Record<string, CheckStatus> = {
    app: "ok",
    supabase: "error",
    service_role: "skipped",
    encryption: "skipped",
    openai: "skipped",
    meta_signature: "skipped",
    ocr: "skipped",
    speech: "skipped",
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    checks.supabase = error ? "error" : "ok";
  } catch {
    checks.supabase = "error";
  }

  try {
    const env = getEnv();
    checks.service_role = env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "warn";
    checks.encryption = env.CREDENTIALS_ENCRYPTION_KEY ? "ok" : "warn";
    checks.openai = env.OPENAI_API_KEY ? "ok" : "warn";
    checks.meta_signature =
      env.META_APP_SECRET || env.WHATSAPP_APP_SECRET ? "ok" : "warn";
    checks.ocr =
      env.OCR_PROVIDER === "mock"
        ? allowMockProviders()
          ? "warn"
          : "error"
        : env.OCR_API_KEY
          ? "ok"
          : "warn";
    checks.speech =
      env.SPEECH_PROVIDER === "mock"
        ? allowMockProviders()
          ? "warn"
          : "error"
        : "ok";
  } catch {
    checks.service_role = "error";
    checks.encryption = "error";
  }

  const hardFailures = Object.entries(checks).filter(([, status]) => status === "error");
  const productionRequired = [
    "supabase",
    "service_role",
    "encryption",
    "openai",
    "meta_signature",
  ] as const;

  const productionGaps = isProduction()
    ? productionRequired.filter((key) => checks[key] !== "ok")
    : [];

  const healthy =
    hardFailures.length === 0 && (!isProduction() || productionGaps.length === 0);

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      checks,
      productionGaps,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
