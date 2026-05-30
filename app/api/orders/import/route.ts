import { NextResponse } from "next/server";
import { parseCsvImport } from "@/lib/import-orders";
import { checkOrderLimit } from "@/lib/subscriptions";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`import:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { csv } = await request.json();
  if (!csv || typeof csv !== "string") {
    return NextResponse.json({ error: "CSV text required" }, { status: 400 });
  }

  const rows = parseCsvImport(csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid rows found" }, { status: 400 });
  }

  const limit = await checkOrderLimit(supabase, user.id);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.error }, { status: 403 });
  }

  const inserts = rows.map((row) => ({
    user_id: user.id,
    customer_name: row.customer_name ?? null,
    customer_phone: row.customer_phone ?? null,
    customer_address: row.customer_address ?? null,
    delivery_area: row.delivery_area ?? null,
    product_name: row.product_name ?? null,
    quantity: row.quantity ?? null,
    cod_amount: row.cod_amount ?? null,
    payment_status: row.cod_amount ? "cod" : "unknown",
    status: row.status ?? "pending",
    input_type: "text",
    raw_input: "csv_import",
  }));

  const { data, error } = await supabase.from("orders").insert(inserts).select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: data?.length ?? 0, ids: data?.map((o) => o.id) });
}
