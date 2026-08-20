import { describe, expect, it } from "vitest";
import { shouldCaptureComment } from "@/lib/channels/comments";
import type { ExtractedOrder } from "@/lib/types/order";

function base(overrides: Partial<ExtractedOrder> = {}): ExtractedOrder {
  return {
    customer_name: null,
    customer_phone: null,
    customer_address: null,
    delivery_area: null,
    product_name: null,
    quantity: null,
    variant: null,
    price: null,
    cod_amount: null,
    payment_status: "unknown",
    delivery_note: null,
    missing_fields: [],
    confidence_score: 0.5,
    notes: [],
    ...overrides,
  };
}

describe("shouldCaptureComment", () => {
  it("captures when phone is present in extracted fields", () => {
    expect(
      shouldCaptureComment(base({ customer_phone: "01712345678" }), "interested")
    ).toBe(true);
  });

  it("captures when phone appears in raw text", () => {
    expect(shouldCaptureComment(base(), "call me 01712345678")).toBe(true);
  });

  it("captures when product name is extracted", () => {
    expect(shouldCaptureComment(base({ product_name: "kurti" }), "nice")).toBe(true);
  });

  it("captures quantity from extracted fields or text", () => {
    expect(shouldCaptureComment(base({ quantity: 2 }), "ok")).toBe(true);
    expect(shouldCaptureComment(base(), "2 pcs please")).toBe(true);
  });

  it("captures positive COD amount", () => {
    expect(shouldCaptureComment(base({ cod_amount: 500 }), "ok")).toBe(true);
  });

  it("ignores comments without order signals", () => {
    expect(shouldCaptureComment(base(), "wow so pretty")).toBe(false);
  });
});
