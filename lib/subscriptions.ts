import type { SupabaseClient } from "@supabase/supabase-js";

export const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  starter: 500,
  pro: 5000,
};

export async function checkOrderLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, orders_limit, status")
    .eq("user_id", userId)
    .maybeSingle();

  const limit = sub?.orders_limit ?? PLAN_LIMITS.free;
  if (sub?.status === "canceled") {
    return { ok: false, error: "Subscription canceled. Upgrade to continue." };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  if ((count ?? 0) >= limit) {
    return {
      ok: false,
      error: `Monthly order limit (${limit}) reached. Upgrade your plan.`,
    };
  }

  return { ok: true };
}
