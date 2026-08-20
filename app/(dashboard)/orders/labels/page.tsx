import Link from "next/link";
import { PrintLabelButton } from "@/components/orders/print-label-button";
import { ShippingLabel } from "@/components/orders/shipping-label";
import { createClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";

export default async function BulkLabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; courier?: string }>;
}) {
  const { ids: idsParam, courier } = await searchParams;
  const ids = (idsParam ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("shop_name, default_pickup_address, preferred_courier")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  let orders: OrderRecord[] = [];
  if (user && ids.length > 0) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .in("id", ids);
    const byId = new Map((data ?? []).map((row) => [row.id, row as OrderRecord]));
    orders = ids.map((id) => byId.get(id)).filter(Boolean) as OrderRecord[];
  }

  const defaultCourier = courier || profile?.preferred_courier || "pathao";

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/orders"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to orders
          </Link>
          <h1 className="text-xl font-bold">Print labels</h1>
          <p className="text-sm text-muted-foreground">
            {orders.length} label{orders.length === 1 ? "" : "s"}
          </p>
        </div>
        {orders.length > 0 ? <PrintLabelButton label="Print all" /> : null}
      </div>

      {orders.length === 0 ? (
        <p className="no-print text-sm text-muted-foreground">
          Pass order IDs as{" "}
          <code className="rounded bg-muted px-1">?ids=id1,id2</code>
          {courier ? (
            <>
              {" "}
              with optional{" "}
              <code className="rounded bg-muted px-1">courier={courier}</code>
            </>
          ) : (
            <>
              {" "}
              and optional{" "}
              <code className="rounded bg-muted px-1">courier=pathao</code>
            </>
          )}
          .
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4 bg-neutral-100 p-4 print:gap-0 print:bg-transparent print:p-0">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={
                index < orders.length - 1 ? "label-page-break" : undefined
              }
            >
              <ShippingLabel
                order={order}
                profile={{
                  shop_name: profile?.shop_name ?? null,
                  default_pickup_address: profile?.default_pickup_address ?? null,
                }}
                courierName={courier || order.courier_name || defaultCourier}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
