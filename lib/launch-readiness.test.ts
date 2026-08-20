import { afterEach, describe, expect, it, vi } from "vitest";
import { checkSupabaseConnectivity, listMissingProductionSecrets } from "@/lib/launch-readiness";

describe("launch readiness", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("lists missing production secrets without revealing values", () => {
    const missing = listMissingProductionSecrets();
    expect(Array.isArray(missing)).toBe(true);
    expect(missing.every((item) => typeof item === "string")).toBe(true);
  });

  it("reports supabase connectivity from auth health endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ version: "test" }), { status: 200 }))
    );
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";

    await expect(checkSupabaseConnectivity()).resolves.toBe("ok");
  });
});
