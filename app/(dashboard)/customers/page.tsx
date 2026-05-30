import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user!.id)
    .order("last_order_at", { ascending: false });

  const list = customers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">Repeat buyers from your orders</p>
      </div>
      {list.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Customers are created automatically when you save orders with a phone number."
          actionHref="/orders/new"
          actionLabel="Create order"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((c) => (
            <Link key={c.id} href={`/customers/${c.id}`}>
              <Card className="hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">{c.name ?? "Unknown"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{c.phone}</p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>{c.order_count} orders • COD total ৳{c.total_cod}</p>
                  <p>{c.delivery_area ?? c.address ?? "—"}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
