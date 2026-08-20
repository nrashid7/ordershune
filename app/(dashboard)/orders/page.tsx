import { OrdersTableClient } from "@/components/orders/orders-table";
import { createClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-brand">Order workspace</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
          Every order, one clear view.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search, review, print, and hand orders to courier.
        </p>
      </div>
      <OrdersTableClient orders={(orders ?? []) as OrderRecord[]} />
    </div>
  );
}
