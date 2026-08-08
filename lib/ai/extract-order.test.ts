import { afterEach, describe, expect, it } from "vitest";
import { extractOrder } from "@/lib/ai/extract-order";

describe("extractOrder (mock path)", () => {
  const previousKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (previousKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = previousKey;
    }
  });

  it("uses mock extraction when OPENAI_API_KEY is unset", async () => {
    delete process.env.OPENAI_API_KEY;

    const result = await extractOrder(
      "Rahim 01712345678 Mirpur 2 pcs kurti COD 1200",
      "text"
    );

    expect(result.customer_phone).toBe("01712345678");
    expect(result.product_name?.toLowerCase()).toContain("kurti");
    expect(result.payment_status).toBe("cod");
    expect(result.cod_amount).toBe(1200);
    expect(result.notes.some((n) => /mock/i.test(n))).toBe(true);
  });

  it("returns empty-input defaults", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await extractOrder("   ", "text");
    expect(result.confidence_score).toBe(0);
    expect(result.missing_fields.length).toBeGreaterThan(0);
  });
});
