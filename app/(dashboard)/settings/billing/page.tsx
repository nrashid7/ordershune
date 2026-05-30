import { BillingClient } from "@/components/settings/billing-client";
import { PLAN_LIMITS } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription</p>
      </div>
      <BillingClient
        plan={sub?.plan ?? "free"}
        status={sub?.status ?? "active"}
        ordersLimit={sub?.orders_limit ?? PLAN_LIMITS.free}
      />
    </div>
  );
}
