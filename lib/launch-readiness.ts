import { allowMockProviders, getEnv, isProduction } from "@/lib/env";

export type CheckStatus = "ok" | "error" | "warn" | "skipped";

export type ReadinessReport = {
  checks: Record<string, CheckStatus>;
  productionGaps: string[];
  healthy: boolean;
};

const PRODUCTION_REQUIRED = [
  "supabase",
  "service_role",
  "encryption",
  "openai",
  "meta_signature",
] as const;

export async function checkSupabaseConnectivity(): Promise<CheckStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return "error";

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
      cache: "no-store",
    });
    return response.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}

export async function checkServiceRole(): Promise<CheckStatus> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return isProduction() ? "error" : "warn";
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").select("id").limit(1);
    return error ? "error" : "ok";
  } catch {
    return "error";
  }
}

export async function getLaunchReadiness(): Promise<ReadinessReport> {
  const checks: Record<string, CheckStatus> = {
    app: "ok",
    supabase: await checkSupabaseConnectivity(),
    service_role: "skipped",
    encryption: "skipped",
    openai: "skipped",
    meta_signature: "skipped",
    ocr: "skipped",
    speech: "skipped",
  };

  try {
    const env = getEnv();
    checks.service_role = await checkServiceRole();
    checks.encryption = env.CREDENTIALS_ENCRYPTION_KEY
      ? "ok"
      : isProduction()
        ? "error"
        : "warn";
    checks.openai = env.OPENAI_API_KEY ? "ok" : isProduction() ? "error" : "warn";
    checks.meta_signature =
      env.META_APP_SECRET || env.WHATSAPP_APP_SECRET
        ? "ok"
        : isProduction()
          ? "error"
          : "warn";
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
    checks.openai = "error";
    checks.meta_signature = "error";
  }

  const hardFailures = Object.entries(checks).filter(([, status]) => status === "error");
  const productionGaps = isProduction()
    ? PRODUCTION_REQUIRED.filter((key) => checks[key] !== "ok")
    : [];

  return {
    checks,
    productionGaps: [...productionGaps],
    healthy:
      hardFailures.length === 0 && (!isProduction() || productionGaps.length === 0),
  };
}

/** Missing production secrets that must be set before go-live. */
export function listMissingProductionSecrets(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.CREDENTIALS_ENCRYPTION_KEY) missing.push("CREDENTIALS_ENCRYPTION_KEY");
  if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
  if (!process.env.META_APP_SECRET && !process.env.WHATSAPP_APP_SECRET) {
    missing.push("META_APP_SECRET or WHATSAPP_APP_SECRET");
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) missing.push("NEXT_PUBLIC_APP_URL");
  return missing;
}
