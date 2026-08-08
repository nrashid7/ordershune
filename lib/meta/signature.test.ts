import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { verifyMetaSignature } from "@/lib/meta/signature";

describe("verifyMetaSignature", () => {
  const secret = "test-app-secret";
  const body = '{"object":"page","entry":[]}';

  it("accepts a valid sha256 signature", () => {
    const digest = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    expect(verifyMetaSignature(body, `sha256=${digest}`, secret)).toBe(true);
  });

  it("rejects missing or malformed headers", () => {
    expect(verifyMetaSignature(body, null, secret)).toBe(false);
    expect(verifyMetaSignature(body, "sha1=abc", secret)).toBe(false);
    expect(verifyMetaSignature(body, "sha256=deadbeef", secret)).toBe(false);
  });

  it("rejects signatures for a different body", () => {
    const digest = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    expect(verifyMetaSignature('{"object":"other"}', `sha256=${digest}`, secret)).toBe(
      false
    );
  });
});
