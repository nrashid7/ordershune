import { NextResponse } from "next/server";
import { listCourierAdapters } from "@/lib/couriers";
import { resolveCourierConfig } from "@/lib/courier-config";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { COURIER_NAMES, dbOrderToRecord } from "@/lib/types/order";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`compare:${ip}`, 30, 60_000);
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

  const { orderId } = await request.json();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: integrations } = await supabase
    .from("courier_integrations")
    .select("*")
    .eq("user_id", user.id);

  const integrationMap = new Map((integrations ?? []).map((i) => [i.courier_name, i]));
  const adapters = listCourierAdapters();
  const comparisons = [];

  for (const name of COURIER_NAMES) {
    const adapter = adapters.find((a) => a.name === name);
    if (!adapter) continue;
    const config = resolveCourierConfig(integrationMap.get(name) ?? null);
    const charge = await adapter.calculateCharge(dbOrderToRecord(order), config);
    comparisons.push({
      courier: name,
      charge: charge.charge,
      currency: charge.currency,
      message: charge.message,
      mock: charge.mock,
      configured: Boolean(config.api_key || config.api_secret),
    });
  }

  comparisons.sort((a, b) => a.charge - b.charge);
  return NextResponse.json({ comparisons });
}
