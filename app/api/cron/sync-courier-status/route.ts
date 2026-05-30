import { NextResponse } from "next/server";
import { syncOrderCourierStatus } from "@/lib/courier-sync";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id, user_id, courier_name, courier_tracking_id, status, customer_phone")
    .eq("status", "courier_booked")
    .not("courier_tracking_id", "is", null)
    .limit(100);

  let synced = 0;
  for (const order of orders ?? []) {
    const { data: integration } = await admin
      .from("courier_integrations")
      .select("*")
      .eq("user_id", order.user_id)
      .eq("courier_name", order.courier_name!)
      .maybeSingle();

    await syncOrderCourierStatus(admin, order, integration);
    synced += 1;
  }

  return NextResponse.json({ synced });
}
