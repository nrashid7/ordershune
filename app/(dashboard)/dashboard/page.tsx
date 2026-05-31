import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/orders/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COURIER_LABELS, COURIER_NAMES } from "@/lib/types/order";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const allOrders = orders ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    total: allOrders.length,
    today: allOrders.filter((o) => o.created_at.startsWith(today)).length,
    pendingCourier: allOrders.filter((o) => o.status === "ready_for_courier").length,
    missingInfo: allOrders.filter((o) => o.status === "missing_info").length,
    completed: allOrders.filter((o) => o.status === "completed").length,
  };

  const { data: integrations } = await supabase
    .from("courier_integrations")
    .select("courier_name, is_active, api_key, api_key_encrypted")
    .eq("user_id", user!.id);

  const integrationMap = new Map(
    (integrations ?? []).map((item) => [item.courier_name, item])
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">অর্ডার ও কুরিয়ার সারাংশ</p>
        </div>
        <Button asChild size="lg">
          <Link href="/orders/new">Quick create order</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total orders", stats.total],
          ["Orders today", stats.today],
          ["Pending courier", stats.pendingCourier],
          ["Missing info", stats.missingInfo],
          ["Completed", stats.completed],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Courier integration status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {COURIER_NAMES.map((name) => {
            const integration = integrationMap.get(name);
            const configured = Boolean(integration?.api_key || integration?.api_key_encrypted);
            return (
              <Badge
                key={name}
                className={
                  configured && integration?.is_active
                    ? "bg-brand-muted text-brand"
                    : "bg-slate-100 text-slate-800"
                }
              >
                {COURIER_LABELS[name]}:{" "}
                {configured ? (integration?.is_active ? "Active" : "Configured") : "Not configured"}
              </Badge>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {allOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Paste a customer message or forward a chat to create your first order."
              actionHref="/orders/new"
              actionLabel="Create order"
            />
          ) : (
            <div className="space-y-3">
              {allOrders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">
                      {order.customer_name ?? "Unknown customer"} — {order.product_name ?? "Product"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_phone ?? "No phone"} • COD {order.cod_amount ?? "—"}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
