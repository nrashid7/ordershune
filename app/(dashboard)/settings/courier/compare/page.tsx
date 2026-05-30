import { CourierCompareClient } from "@/components/settings/courier-compare-client";
import { createClient } from "@/lib/supabase/server";

export default async function CourierComparePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, customer_name, product_name")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const options = (orders ?? []).map((o) => ({
    id: o.id,
    label: `${o.customer_name ?? "Customer"} — ${o.product_name ?? "Product"}`,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Courier charge comparison</h1>
        <p className="text-sm text-muted-foreground">Estimate delivery cost across providers</p>
      </div>
      {options.length === 0 ? (
        <p className="text-muted-foreground">Create an order first to compare rates.</p>
      ) : (
        <CourierCompareClient orders={options} />
      )}
    </div>
  );
}
