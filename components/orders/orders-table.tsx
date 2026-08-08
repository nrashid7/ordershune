"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { DeleteOrderButton } from "@/components/orders/delete-order-button";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportOrdersDialog } from "@/components/orders/import-orders-dialog";
import { CSV_HEADERS, orderToCsvRow } from "@/lib/formatting";
import type { OrderRecord } from "@/lib/types/order";

export function OrdersTableClient({ orders }: { orders: OrderRecord[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const haystack = [
        order.customer_name,
        order.customer_phone,
        order.product_name,
        order.customer_address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && haystack.includes(query.toLowerCase());
    });
  }, [orders, query, status]);

  const exportCsv = () => {
    const rows = filtered.map(orderToCsvRow).join("\n");
    const blob = new Blob([`${CSV_HEADERS}\n${rows}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ordershune-orders.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((o) => o.id)));
    }
  };

  const printSelected = () => {
    if (selected.size === 0) {
      toast.error("Select at least one order");
      return;
    }
    window.open(`/orders/labels?ids=${Array.from(selected).join(",")}`, "_blank");
  };

  const exportManifest = () => {
    if (selected.size === 0) {
      toast.error("Select at least one order");
      return;
    }
    window.open(
      `/api/orders/manifest?courier=pathao&ids=${Array.from(selected).join(",")}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md space-y-2">
          <Label htmlFor="orders-search" className="sr-only">
            Search orders
          </Label>
          <Input
            id="orders-search"
            placeholder="Search orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.size > 0 ? (
            <>
              <Button variant="outline" onClick={printSelected}>
                Print selected ({selected.size})
              </Button>
              <Button variant="outline" onClick={exportManifest}>
                Export manifest
              </Button>
            </>
          ) : null}
          <ImportOrdersDialog />
          <Button variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/orders/new">Create order</Link>
          </Button>
        </div>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="ready_for_courier">Ready</TabsTrigger>
          <TabsTrigger value="missing_info">Missing info</TabsTrigger>
          <TabsTrigger value="courier_booked">Booked</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching orders"
          description="Try another filter or create a new order."
          actionHref="/orders/new"
          actionLabel="Create order"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleAll}
                    aria-label="Select all orders"
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>COD</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(order.id)}
                      onCheckedChange={() => toggleSelect(order.id)}
                      aria-label={`Select order ${order.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customer_name ?? "—"}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer_phone ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell>{order.product_name ?? "—"}</TableCell>
                  <TableCell>{order.cod_amount ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/orders/${order.id}`}>View</Link>
                      </Button>
                      <DeleteOrderButton
                        orderId={order.id}
                        customerName={order.customer_name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
