import OpenAI from "openai";
import { z } from "zod";
import { EXTRACTION_SYSTEM_PROMPT } from "./prompts";
import type { ExtractedOrder, InputType } from "@/lib/types/order";

const extractedOrderSchema = z.object({
  customer_name: z.string().nullable(),
  customer_phone: z.string().nullable(),
  customer_address: z.string().nullable(),
  delivery_area: z.string().nullable(),
  product_name: z.string().nullable(),
  quantity: z.number().nullable(),
  variant: z.string().nullable(),
  price: z.number().nullable(),
  cod_amount: z.number().nullable(),
  payment_status: z.enum(["paid", "cod", "partial", "unknown"]),
  delivery_note: z.string().nullable(),
  missing_fields: z.array(z.string()),
  confidence_score: z.number(),
  notes: z.array(z.string()),
});

const REQUIRED_FIELDS = [
  "customer_name",
  "customer_phone",
  "customer_address",
  "product_name",
  "cod_amount",
] as const;

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (/^01[3-9]\d{8}$/.test(digits)) return digits;
  if (/^8801[3-9]\d{8}$/.test(digits)) return digits.slice(2);
  return phone;
}

function computeMissingFields(data: Omit<ExtractedOrder, "missing_fields">) {
  const missing: string[] = [];
  if (!data.customer_name) missing.push("customer_name");
  if (!data.customer_phone) missing.push("customer_phone");
  if (!data.customer_address) missing.push("customer_address");
  if (!data.product_name) missing.push("product_name");
  if (data.cod_amount == null && data.payment_status === "cod")
    missing.push("cod_amount");
  if (data.payment_status === "unknown") missing.push("payment_status");
  return missing;
}

function mockExtract(text: string): ExtractedOrder {
  const phoneMatch = text.match(/(?:\+?880)?(01[3-9]\d{8})/i);
  const phone = normalizePhone(phoneMatch?.[1] ?? null);

  const codMatch = text.match(/(?:cod|ক্যাশ|cash)\s*[:\-]?\s*(\d+)/i);
  const priceMatch = text.match(/(\d{3,5})\s*(?:taka|tk|টাকা)?/i);
  const amount = codMatch
    ? Number(codMatch[1])
    : priceMatch
      ? Number(priceMatch[1])
      : null;

  const hasCod = /cod|cash on delivery|ক্যাশ/i.test(text);
  const hasPaid = /paid|advance|prepaid|paid already/i.test(text);

  let payment_status: ExtractedOrder["payment_status"] = "unknown";
  if (hasCod) payment_status = "cod";
  else if (hasPaid) payment_status = "paid";

  const qtyMatch = text.match(/(\d+)\s*(?:ta|pcs|piece|টি|টা)/i);
  const quantity = qtyMatch ? Number(qtyMatch[1]) : null;

  const nameMatch = text.match(/^([A-Za-z\u0980-\u09FF]+(?:\s+[A-Za-z\u0980-\u09FF]+)?)/);
  const customer_name = nameMatch?.[1]?.trim() ?? null;

  const areaKeywords = [
    "mirpur",
    "uttara",
    "dhanmondi",
    "motijheel",
    "bashundhara",
    "zigatola",
    "gulshan",
    "banani",
  ];
  const lower = text.toLowerCase();
  const delivery_area =
    areaKeywords.find((area) => lower.includes(area)) ?? null;

  const productPatterns = [
    /(\d+\s*)?(kurti|shirt|saree|t-shirt|wallet|dress|pant|shoe|bag)/i,
  ];
  const productMatch = productPatterns.find((pattern) => pattern.test(text));
  const product_name = productMatch
    ? text.match(productPatterns[0])?.[2] ?? null
    : null;

  const base = {
    customer_name,
    customer_phone: phone,
    customer_address: delivery_area ? `${delivery_area}, Dhaka` : null,
    delivery_area,
    product_name,
    quantity: quantity ?? (product_name ? 1 : null),
    variant: null,
    price: amount,
    cod_amount: payment_status === "cod" ? amount : null,
    payment_status,
    delivery_note: null,
    confidence_score: 0.65,
    notes: ["Extracted using mock heuristics (no OPENAI_API_KEY configured)"],
  };

  return {
    ...base,
    missing_fields: computeMissingFields(base),
  };
}

export async function extractOrder(
  text: string,
  inputType: InputType
): Promise<ExtractedOrder> {
  const trimmed = text.trim();
  if (!trimmed) {
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
      missing_fields: [...REQUIRED_FIELDS],
      confidence_score: 0,
      notes: ["Empty input"],
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return mockExtract(trimmed);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Input type: ${inputType}\n\nMessage:\n${trimmed}`,
      },
    ],
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return mockExtract(trimmed);
  }

  const parsed = extractedOrderSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    return mockExtract(trimmed);
  }

  const data = parsed.data;
  const normalized = {
    ...data,
    customer_phone: normalizePhone(data.customer_phone),
    missing_fields:
      data.missing_fields.length > 0
        ? data.missing_fields
        : computeMissingFields(data),
  };

  return normalized;
}
