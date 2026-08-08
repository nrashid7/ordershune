import { NextResponse } from "next/server";
import { buildManifestCsv } from "@/lib/labels/manifest";
import { createClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courier = searchParams.get("courier") ?? "";
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "ids query parameter required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byId = new Map((data ?? []).map((row) => [row.id, row as OrderRecord]));
  const orders = ids.map((id) => byId.get(id)).filter(Boolean) as OrderRecord[];
  const csv = buildManifestCsv(orders, courier);
  const filename = `manifest-${courier || "orders"}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
