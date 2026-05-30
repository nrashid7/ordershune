import type { OrderStatus } from "@/lib/types/order";

export type ImportRow = {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  delivery_area?: string;
  product_name?: string;
  quantity?: number;
  cod_amount?: number;
  status?: OrderStatus;
};

export function parseCsvImport(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const rows: ImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].match(/("([^"]|"")*"|[^,]+)/g)?.map((c) =>
      c.replace(/^"|"$/g, "").replace(/""/g, '"').trim()
    ) ?? [];

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? "";
    });

    rows.push({
      customer_name: row.customer_name || row.name || undefined,
      customer_phone: row.customer_phone || row.phone || undefined,
      customer_address: row.customer_address || row.address || undefined,
      delivery_area: row.delivery_area || row.area || undefined,
      product_name: row.product_name || row.product || undefined,
      quantity: row.quantity ? Number(row.quantity) : undefined,
      cod_amount: row.cod_amount ? Number(row.cod_amount) : undefined,
      status: (row.status as OrderStatus) || "pending",
    });
  }

  return rows;
}
