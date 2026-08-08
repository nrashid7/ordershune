import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintLabelButton } from "@/components/orders/print-label-button";
import { ShippingLabel } from "@/components/orders/shipping-label";
import { createClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";

export default async function OrderLabelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ courier?: string }>;
}) {
  const { id } = await params;
  const { courier } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("shop_name, default_pickup_address, preferred_courier")
    .eq("id", user.id)
    .maybeSingle();

  const courierName =
    courier ||
    (order as OrderRecord).courier_name ||
    profile?.preferred_courier ||
    "pathao";

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/orders/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to order
          </Link>
          <h1 className="text-xl font-bold">Shipping label</h1>
        </div>
        <PrintLabelButton />
      </div>

      <div className="flex justify-center bg-neutral-100 p-4 print:bg-transparent print:p-0">
        <ShippingLabel
          order={order as OrderRecord}
          profile={{
            shop_name: profile?.shop_name ?? null,
            default_pickup_address: profile?.default_pickup_address ?? null,
          }}
          courierName={courierName}
        />
      </div>
    </div>
  );
}
