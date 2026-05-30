"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BillingClient({
  plan,
  status,
  ordersLimit,
}: {
  plan: string;
  status: string;
  ordersLimit: number;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(targetPlan: string) {
    setLoading(targetPlan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold capitalize">{plan}</p>
          <p className="text-sm text-muted-foreground">
            Status: {status} • {ordersLimit} orders / month
          </p>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button disabled={loading !== null || plan === "starter"} onClick={() => checkout("starter")}>
          {loading === "starter" ? "Loading..." : "Upgrade to Starter"}
        </Button>
        <Button
          variant="outline"
          disabled={loading !== null || plan === "pro"}
          onClick={() => checkout("pro")}
        >
          {loading === "pro" ? "Loading..." : "Upgrade to Pro"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Requires STRIPE_SECRET_KEY and price IDs in environment. Without Stripe, upgrades show an error.
      </p>
    </div>
  );
}
