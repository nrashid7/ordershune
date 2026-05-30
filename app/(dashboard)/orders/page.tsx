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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">অর্ডার তালিকা / Order list</p>
      </div>
      <OrdersTableClient orders={(orders ?? []) as OrderRecord[]} />
    </div>
  );
}
