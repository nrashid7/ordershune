import { afterEach, describe, expect, it } from "vitest";
import { allowMockProviders, resetEnvCache, validateEnv } from "@/lib/env";

const KEYS = [
  "NODE_ENV",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CREDENTIALS_ENCRYPTION_KEY",
  "OPENAI_API_KEY",
  "META_APP_SECRET",
  "WHATSAPP_APP_SECRET",
  "ALLOW_MOCK_PROVIDERS",
  "OCR_PROVIDER",
  "SPEECH_PROVIDER",
] as const;

describe("production env guards", () => {
  const snapshot = new Map<string, string | undefined>();

  afterEach(() => {
    const env = process.env as Record<string, string | undefined>;
    for (const key of KEYS) {
      const value = snapshot.get(key);
      if (value === undefined) delete env[key];
      else env[key] = value;
    }
    snapshot.clear();
    resetEnvCache();
  });

  function setEnv(key: (typeof KEYS)[number], value: string | undefined) {
    if (!snapshot.has(key)) snapshot.set(key, process.env[key]);
    const env = process.env as Record<string, string | undefined>;
    if (value === undefined) delete env[key];
    else env[key] = value;
    resetEnvCache();
  }

  it("allows mock providers outside production", () => {
    setEnv("NODE_ENV", "test");
    setEnv("ALLOW_MOCK_PROVIDERS", undefined);
    expect(allowMockProviders()).toBe(true);
  });

  it("blocks mock providers in production unless overridden", () => {
    setEnv("NODE_ENV", "production");
    setEnv("ALLOW_MOCK_PROVIDERS", undefined);
    expect(allowMockProviders()).toBe(false);

    setEnv("ALLOW_MOCK_PROVIDERS", "true");
    expect(allowMockProviders()).toBe(true);
  });

  it("does not crash boot when optional production secrets are missing", () => {
    setEnv("NODE_ENV", "production");
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    setEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    setEnv("CREDENTIALS_ENCRYPTION_KEY", undefined);
    setEnv("OPENAI_API_KEY", undefined);
    setEnv("META_APP_SECRET", undefined);
    setEnv("WHATSAPP_APP_SECRET", undefined);
    setEnv("ALLOW_MOCK_PROVIDERS", undefined);

    expect(() => validateEnv()).not.toThrow();
  });

  it("throws in production when public Supabase keys are missing", () => {
    setEnv("NODE_ENV", "production");
    setEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);

    expect(() => validateEnv()).toThrow(/Missing required Supabase/);
  });

  it("passes validateEnv in production when required secrets are set", () => {
    setEnv("NODE_ENV", "production");
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    setEnv("SUPABASE_SERVICE_ROLE_KEY", "service");
    setEnv("CREDENTIALS_ENCRYPTION_KEY", "a".repeat(64));
    setEnv("OPENAI_API_KEY", "sk-test");
    setEnv("META_APP_SECRET", "meta-secret");
    setEnv("NEXT_PUBLIC_APP_URL", "https://ordershune.vercel.app");

    expect(() => validateEnv()).not.toThrow();
  });
});
