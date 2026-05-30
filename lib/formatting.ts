import type {
  ExtractedOrder,
  OrderRecord,
  OrderStatus,
  Profile,
} from "@/lib/types/order";

type OrderLike = Partial<OrderRecord> & Partial<ExtractedOrder>;

function val(value: unknown): string {
  if (value == null || value === "") return "—";
  return String(value);
}

export function deriveOrderStatus(extracted: ExtractedOrder): OrderStatus {
  if (extracted.missing_fields.length > 0) return "missing_info";
  return "pending";
}

export function generateOrderSummary(order: OrderLike): string {
  return [
    "Order Summary",
    `Customer: ${val(order.customer_name)}`,
    `Phone: ${val(order.customer_phone)}`,
    `Address: ${val(order.customer_address)}`,
    `Area: ${val(order.delivery_area)}`,
    `Product: ${val(order.product_name)}`,
    `Qty: ${val(order.quantity)}`,
    `Variant: ${val(order.variant)}`,
    `Price: ${val(order.price)}`,
    `Payment: ${val(order.payment_status)}`,
    `COD: ${val(order.cod_amount)}`,
    `Note: ${val(order.delivery_note)}`,
  ].join("\n");
}

export function generateCourierFormat(
  order: OrderLike,
  profile?: Pick<Profile, "default_pickup_address"> | null
): string {
  const instruction =
    order.delivery_note ??
    "Please call customer before delivery. Handle with care.";

  return [
    `Name: ${val(order.customer_name)}`,
    `Phone: ${val(order.customer_phone)}`,
    `Address: ${val(order.customer_address)}`,
    `Area: ${val(order.delivery_area)}`,
    `Product: ${val(order.product_name)}`,
    `COD Amount: ${val(order.cod_amount ?? order.price)}`,
    `Pickup: ${val(profile?.default_pickup_address ?? "Seller pickup address")}`,
    `Instruction: ${instruction}`,
  ].join("\n");
}

export function generateCustomerConfirmation(order: OrderLike): string {
  const name = order.customer_name ?? "Apu/Bhai";
  const product = order.product_name ?? "product";
  const qty = order.quantity ?? 1;
  const amount = order.cod_amount ?? order.price ?? "—";

  return `আপনার অর্ডারটি কনফার্ম করা হলো ✅

${name}, আপনার ${qty} টি ${product} অর্ডার রেকর্ড করা হয়েছে।
${order.payment_status === "cod" ? `COD Amount: ${amount} টাকা` : "Payment: Prepaid"}
Delivery: ${order.customer_address ?? order.delivery_area ?? "আপনার দেওয়া ঠিকানা"}

ধন্যবাদ! 🙏`;
}

export function formatWhatsAppOrderReply(order: OrderLike): string {
  const missing =
    order.missing_fields && order.missing_fields.length > 0
      ? order.missing_fields.join(", ")
      : "None";

  return [
    "✅ Order extracted",
    "",
    `Customer: ${val(order.customer_name)}`,
    `Phone: ${val(order.customer_phone)}`,
    `Address: ${val(order.customer_address)}`,
    `Area: ${val(order.delivery_area)}`,
    `Product: ${val(order.product_name)}`,
    `Qty: ${val(order.quantity)}`,
    `Variant: ${val(order.variant)}`,
    `COD: ${val(order.cod_amount ?? order.price)}`,
    `Missing: ${missing}`,
    "",
    "Reply:",
    "1 Confirm",
    "2 Edit",
    "3 Courier format",
    "4 Cancel",
  ].join("\n");
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  return digits;
}

export function orderToCsvRow(order: OrderRecord): string {
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    order.id,
    order.customer_name,
    order.customer_phone,
    order.customer_address,
    order.product_name,
    order.quantity,
    order.cod_amount,
    order.status,
    order.created_at,
  ]
    .map(escape)
    .join(",");
}

export const CSV_HEADERS =
  "id,customer_name,customer_phone,customer_address,product_name,quantity,cod_amount,status,created_at";
