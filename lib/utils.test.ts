import { describe, expect, it } from "vitest";
import { code128Svg } from "@/lib/labels/barcode";
import { buildManifestCsv } from "@/lib/labels/manifest";
import { parseCsvImport } from "@/lib/import-orders";
import { normalizePhone } from "@/lib/formatting";
import type { OrderRecord } from "@/lib/types/order";

function sampleOrder(overrides: Partial<OrderRecord> = {}): OrderRecord {
  return {
    id: "11111111-2222-3333-4444-555555555555",
    user_id: "user-1",
    customer_name: "Rahim",
    customer_phone: "01712345678",
    customer_address: 'House "12", Mirpur',
    delivery_area: "Mirpur",
    product_name: "Kurti",
    quantity: 2,
    variant: "Red",
    price: 1200,
    cod_amount: 1200,
    payment_status: "cod",
    delivery_note: "Call first",
    raw_input: null,
    input_type: "text",
    extracted_json: null,
    missing_fields: null,
    confidence_score: null,
    status: "pending",
    courier_name: "pathao",
    courier_status: null,
    courier_tracking_id: null,
    courier_payload: null,
    created_at: "2026-08-08T00:00:00.000Z",
    updated_at: "2026-08-08T00:00:00.000Z",
    ...overrides,
  };
}

describe("normalizePhone", () => {
  it("prefixes local numbers with 88", () => {
    expect(normalizePhone("01712345678")).toBe("8801712345678");
  });

  it("keeps numbers that already start with 880", () => {
    expect(normalizePhone("8801712345678")).toBe("8801712345678");
  });
});

describe("code128Svg", () => {
  it("returns an SVG string with barcode markup", () => {
    const svg = code128Svg("ORD123");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("<rect");
    expect(svg).toContain("ORD123");
  });
});

describe("buildManifestCsv", () => {
  it("builds Pathao columns and escapes double quotes", () => {
    const csv = buildManifestCsv([sampleOrder()], "pathao");
    const lines = csv.split("\n");
    expect(lines[0]).toContain('"Recipient Name"');
    expect(lines[1]).toContain('"House ""12"", Mirpur"');
    expect(lines[1]).toContain('"Rahim"');
  });

  it("uses courier-specific headers for redx and steadfast", () => {
    expect(buildManifestCsv([sampleOrder()], "redx")).toContain(
      '"Cash Collection Amount"'
    );
    expect(buildManifestCsv([sampleOrder()], "steadfast")).toContain('"Invoice"');
    expect(buildManifestCsv([sampleOrder()], "delivery_tiger")).toContain(
      '"Product Details"'
    );
  });
});

describe("parseCsvImport", () => {
  it("parses header rows into import objects", () => {
    const rows = parseCsvImport(
      [
        "customer_name,customer_phone,product_name,quantity,cod_amount",
        "Rahim,01712345678,Kurti,2,1200",
      ].join("\n")
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].customer_name).toBe("Rahim");
    expect(rows[0].quantity).toBe(2);
    expect(rows[0].cod_amount).toBe(1200);
  });
});
