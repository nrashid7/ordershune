import { describe, expect, it } from "vitest";
import { mergeExtractedFields } from "@/lib/channels/pipeline";
import type { ExtractedOrder, OrderRecord } from "@/lib/types/order";

function extracted(overrides: Partial<ExtractedOrder> = {}): ExtractedOrder {
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
    confidence_score: 0.4,
    notes: ["new"],
    ...overrides,
  };
}

describe("mergeExtractedFields", () => {
  it("keeps existing non-null fields when new extraction is null", () => {
    const existing: Partial<OrderRecord> = {
      customer_name: "Rahim",
      customer_phone: "01711111111",
      customer_address: "Mirpur",
      product_name: "shirt",
      quantity: 2,
      cod_amount: 800,
      payment_status: "cod",
      confidence_score: 0.9,
      extracted_json: extracted({
        customer_name: "Rahim",
        notes: ["prior"],
      }),
    };

    const merged = mergeExtractedFields(
      existing,
      extracted({
        customer_name: null,
        customer_phone: null,
        customer_address: "Dhanmondi",
        product_name: "kurti",
        quantity: null,
        payment_status: "unknown",
        confidence_score: 0.5,
      })
    );

    expect(merged.customer_name).toBe("Rahim");
    expect(merged.customer_phone).toBe("01711111111");
    expect(merged.customer_address).toBe("Mirpur");
    expect(merged.product_name).toBe("shirt");
    expect(merged.quantity).toBe(2);
    expect(merged.cod_amount).toBe(800);
    expect(merged.payment_status).toBe("cod");
    expect(merged.confidence_score).toBe(0.9);
    expect(merged.notes).toEqual(["prior", "new"]);
  });

  it("fills missing fields from the new extraction", () => {
    const merged = mergeExtractedFields(
      { customer_name: null, product_name: null },
      extracted({
        customer_name: "Karim",
        customer_phone: "01822222222",
        customer_address: "Uttara",
        product_name: "bag",
        quantity: 1,
        cod_amount: 450,
        payment_status: "cod",
      })
    );

    expect(merged.customer_name).toBe("Karim");
    expect(merged.product_name).toBe("bag");
    expect(merged.missing_fields).toEqual([]);
  });
});
