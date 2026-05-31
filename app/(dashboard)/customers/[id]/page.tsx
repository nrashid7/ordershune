import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customerData } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  const customer = customerData as CustomerRow | null;

  if (!customer) notFound();

  const { data: ordersData } = await supabase
    .from("orders")
    .select("id, product_name, cod_amount, status, created_at")
    .eq("user_id", user!.id)
    .eq("customer_phone", customer.phone)
    .order("created_at", { ascending: false })
    .limit(20);

  const orders = (ordersData ?? []) as {
    id: string;
    product_name: string | null;
    cod_amount: number | null;
    status: string;
    created_at: string;
  }[];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/customers">← Customers</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{customer.name ?? "Customer"}</CardTitle>
          <p className="text-muted-foreground">{customer.phone}</p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Address: {customer.address ?? "—"}</p>
          <p>Area: {customer.delivery_area ?? "—"}</p>
          <p>Orders: {customer.order_count} • Total COD: ৳{customer.total_cod}</p>
          {customer.notes ? <p>Notes: {customer.notes}</p> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <span>
                {o.product_name ?? "Product"} • ৳{o.cod_amount ?? "—"}
              </span>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
