import { CodTable } from "@/components/cod/cod-table";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function CodPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("cod_entries")
    .select("*, orders(id, customer_name, courier_tracking_id)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const list = entries ?? [];
  const pending = list.filter((e) => e.status === "pending");
  const collected = list.filter((e) => e.status === "collected");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">COD reconciliation</h1>
        <p className="text-sm text-muted-foreground">Track collection and payout from couriers</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{pending.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Collected</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{collected.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending amount</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ৳{pending.reduce((s, e) => s + Number(e.cod_amount), 0)}
          </CardContent>
        </Card>
      </div>
      {list.length === 0 ? (
        <EmptyState
          title="No COD entries"
          description="COD rows are created when you save orders with COD payment."
          actionHref="/orders"
          actionLabel="View orders"
        />
      ) : (
        <CodTable entries={list as Parameters<typeof CodTable>[0]["entries"]} />
      )}
    </div>
  );
}
