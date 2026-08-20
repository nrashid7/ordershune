import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  Clock3,
  PackageCheck,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/orders/status-badge";
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
    today: allOrders.filter((order) => order.created_at.startsWith(today)).length,
    pendingCourier: allOrders.filter((order) => order.status === "ready_for_courier").length,
    missingInfo: allOrders.filter((order) => order.status === "missing_info").length,
    completed: allOrders.filter((order) => order.status === "completed").length,
  };

  const { data: integrations } = await supabase
    .from("courier_integrations")
    .select("courier_name, is_active, api_key, api_key_encrypted")
    .eq("user_id", user!.id);

  const integrationMap = new Map(
    (integrations ?? []).map((item) => [item.courier_name, item])
  );
  const activeCouriers = COURIER_NAMES.filter((name) => {
    const integration = integrationMap.get(name);
    return Boolean(
      (integration?.api_key || integration?.api_key_encrypted) && integration?.is_active
    );
  }).length;

  const metricCards = [
    {
      label: "Orders today",
      value: stats.today,
      helper: `${stats.total} total orders`,
      icon: ShoppingBag,
      tone: "bg-brand-muted text-brand",
    },
    {
      label: "Ready for courier",
      value: stats.pendingCourier,
      helper: "Ready to book",
      icon: PackageCheck,
      tone: "bg-sky-100 text-sky-800",
    },
    {
      label: "Needs information",
      value: stats.missingInfo,
      helper: "Requires follow-up",
      icon: CircleAlert,
      tone: "bg-amber-100 text-amber-900",
    },
    {
      label: "Completed",
      value: stats.completed,
      helper: "All-time deliveries",
      icon: Clock3,
      tone: "bg-violet-100 text-violet-900",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand">Operations overview</p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            Keep today moving.
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Review new orders, resolve missing details, and send ready parcels to courier.
          </p>
        </div>
        <Button asChild size="lg" className="self-start sm:self-auto">
          <Link href="/orders/new">
            <Plus aria-hidden="true" />
            Create order
          </Link>
        </Button>
      </section>

      <section aria-label="Order metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, helper, icon: Icon, tone }) => (
          <Card key={label} className="gap-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{label}</CardTitle>
              <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold tabular-nums tracking-[-0.04em]">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.75fr)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
            <div>
              <CardTitle className="text-xl font-bold">Recent orders</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">The latest activity across your channels.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/orders">
                View all <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {allOrders.length === 0 ? (
              <EmptyState
                title="Your first order starts here"
                description="Paste a customer message or forward a chat to create a clean, courier-ready order."
                actionHref="/orders/new"
                actionLabel="Create order"
              />
            ) : (
              <div className="divide-y">
                {allOrders.slice(0, 6).map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="group flex min-h-18 items-center gap-3 py-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 sm:gap-4"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted font-heading font-bold text-foreground">
                      {(order.customer_name ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold group-hover:text-brand">
                        {order.customer_name ?? "Unknown customer"}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {order.product_name ?? "Product not added"} · {order.customer_phone ?? "No phone"}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="font-semibold tabular-nums">৳{order.cod_amount ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">COD</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-foreground text-background">
            <CardHeader>
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-300 text-emerald-950">
                <Truck className="size-5" aria-hidden="true" />
              </span>
              <CardTitle className="mt-4 text-xl font-bold text-background">Courier connections</CardTitle>
              <p className="text-sm leading-6 text-background/65">
                {activeCouriers} of {COURIER_NAMES.length} couriers active
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {COURIER_NAMES.map((name) => {
                const integration = integrationMap.get(name);
                const configured = Boolean(integration?.api_key || integration?.api_key_encrypted);
                const active = configured && integration?.is_active;
                return (
                  <div key={name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <span className="text-sm font-semibold">{COURIER_LABELS[name]}</span>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${active ? "text-emerald-300" : "text-background/50"}`}>
                      <span className={`size-1.5 rounded-full ${active ? "bg-emerald-300" : "bg-background/30"}`} aria-hidden="true" />
                      {active ? "Active" : configured ? "Paused" : "Connect"}
                    </span>
                  </div>
                );
              })}
              <Button asChild variant="secondary" className="mt-3 w-full">
                <Link href="/settings/courier">Manage couriers</Link>
              </Button>
            </CardContent>
          </Card>

          {stats.missingInfo > 0 ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-800" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-amber-950">{stats.missingInfo} orders need attention</p>
                  <p className="mt-1 text-sm leading-6 text-amber-900/70">Fill missing customer details before courier booking.</p>
                  <Link href="/orders" className="mt-3 inline-flex min-h-10 items-center text-sm font-bold text-amber-950 underline underline-offset-4">
                    Review orders
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
