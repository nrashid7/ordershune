"use client";

import { useState } from "react";
import { toast } from "sonner";
import { COURIER_LABELS, type CourierName } from "@/lib/types/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CourierCompareClient({ orders }: { orders: Array<{ id: string; label: string }> }) {
  const [orderId, setOrderId] = useState(orders[0]?.id ?? "");
  const [results, setResults] = useState<
    Array<{ courier: string; charge: number; currency: string; mock: boolean; configured: boolean }>
  >([]);
  const [loading, setLoading] = useState(false);

  async function compare() {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/courier/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.comparisons ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compare failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare courier charges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          className="flex h-10 w-full rounded-md border px-3 text-sm"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        >
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <Button onClick={compare} disabled={loading || !orderId}>
          {loading ? "Comparing..." : "Compare"}
        </Button>
        {results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.courier} className="flex justify-between rounded border p-3 text-sm">
                <span>
                  {COURIER_LABELS[r.courier as CourierName] ?? r.courier}
                  {r.mock ? " (estimate)" : ""}
                  {!r.configured ? " — not configured" : ""}
                </span>
                <span className="font-medium">
                  {r.charge} {r.currency}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
