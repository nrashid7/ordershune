import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/components/orders/order-detail-client";
import { createClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!order) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_courier, default_pickup_address")
    .eq("id", user!.id)
    .maybeSingle();

  return <OrderDetailClient order={order as OrderRecord} profile={profile} />;
}
