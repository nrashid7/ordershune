import type { OrderRecord } from "@/lib/types/order";

type ColumnMap = {
  header: string;
  value: (order: OrderRecord) => string | number | null | undefined;
};

const PATHAO_COLUMNS: ColumnMap[] = [
  { header: "Merchant Order ID", value: (o) => o.id },
  { header: "Recipient Name", value: (o) => o.customer_name },
  { header: "Recipient Phone", value: (o) => o.customer_phone },
  { header: "Recipient Address", value: (o) => o.customer_address },
  { header: "Delivery Area", value: (o) => o.delivery_area },
  { header: "Item Description", value: (o) => o.product_name },
  { header: "Item Quantity", value: (o) => o.quantity ?? 1 },
  { header: "Amount to Collect", value: (o) => o.cod_amount ?? o.price ?? 0 },
  { header: "Special Instruction", value: (o) => o.delivery_note },
];

const REDX_COLUMNS: ColumnMap[] = [
  { header: "Customer Name", value: (o) => o.customer_name },
  { header: "Customer Phone", value: (o) => o.customer_phone },
  { header: "Customer Address", value: (o) => o.customer_address },
  { header: "Delivery Area", value: (o) => o.delivery_area },
  { header: "Cash Collection Amount", value: (o) => o.cod_amount ?? o.price ?? 0 },
  { header: "Parcel Value", value: (o) => o.price ?? o.cod_amount ?? 0 },
  { header: "Instruction", value: (o) => o.delivery_note },
  { header: "Product Name", value: (o) => o.product_name },
  { header: "Quantity", value: (o) => o.quantity ?? 1 },
];

const STEADFAST_COLUMNS: ColumnMap[] = [
  { header: "Invoice", value: (o) => o.id.slice(0, 8) },
  { header: "Recipient Name", value: (o) => o.customer_name },
  { header: "Recipient Phone", value: (o) => o.customer_phone },
  {
    header: "Recipient Address",
    value: (o) => [o.customer_address, o.delivery_area].filter(Boolean).join(", "),
  },
  { header: "COD Amount", value: (o) => o.cod_amount ?? o.price ?? 0 },
  { header: "Note", value: (o) => o.delivery_note },
  { header: "Item Description", value: (o) => o.product_name },
  { header: "Quantity", value: (o) => o.quantity ?? 1 },
];

const DELIVERY_TIGER_COLUMNS: ColumnMap[] = [
  { header: "Customer Name", value: (o) => o.customer_name },
  { header: "Customer Phone", value: (o) => o.customer_phone },
  { header: "Customer Address", value: (o) => o.customer_address },
  { header: "COD Amount", value: (o) => o.cod_amount ?? o.price ?? 0 },
  { header: "Product Details", value: (o) => o.product_name },
  { header: "Quantity", value: (o) => o.quantity ?? 1 },
  { header: "Note", value: (o) => o.delivery_note },
  { header: "Area", value: (o) => o.delivery_area },
];

const GENERIC_COLUMNS: ColumnMap[] = [
  { header: "Order ID", value: (o) => o.id },
  { header: "Customer Name", value: (o) => o.customer_name },
  { header: "Phone", value: (o) => o.customer_phone },
  { header: "Address", value: (o) => o.customer_address },
  { header: "Area", value: (o) => o.delivery_area },
  { header: "Product", value: (o) => o.product_name },
  { header: "Quantity", value: (o) => o.quantity ?? 1 },
  { header: "COD", value: (o) => o.cod_amount ?? o.price ?? 0 },
  { header: "Note", value: (o) => o.delivery_note },
];

const COLUMN_MAPS: Record<string, ColumnMap[]> = {
  pathao: PATHAO_COLUMNS,
  redx: REDX_COLUMNS,
  steadfast: STEADFAST_COLUMNS,
  delivery_tiger: DELIVERY_TIGER_COLUMNS,
};

function escapeCsv(value: string | number | null | undefined): string {
  const raw = value == null ? "" : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

export function buildManifestCsv(
  orders: OrderRecord[],
  courier: string | null | undefined
): string {
  const key = (courier ?? "").toLowerCase().trim();
  const columns = COLUMN_MAPS[key] ?? GENERIC_COLUMNS;
  const header = columns.map((c) => escapeCsv(c.header)).join(",");
  const rows = orders.map((order) =>
    columns.map((c) => escapeCsv(c.value(order))).join(",")
  );
  return [header, ...rows].join("\n");
}
