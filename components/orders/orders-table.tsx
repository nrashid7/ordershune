"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, Plus, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { DeleteOrderButton } from "@/components/orders/delete-order-button";
import { ImportOrdersDialog } from "@/components/orders/import-orders-dialog";
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
import { CSV_HEADERS, orderToCsvRow } from "@/lib/formatting";
import type { OrderRecord } from "@/lib/types/order";

const statusFilters = [
  ["all", "All"],
  ["pending", "Pending"],
  ["ready_for_courier", "Ready"],
  ["missing_info", "Missing info"],
  ["courier_booked", "Booked"],
  ["completed", "Completed"],
];

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
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((order) => order.id)));
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
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Label htmlFor="orders-search" className="sr-only">Search orders</Label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="orders-search"
              className="h-11 pl-10"
              placeholder="Search customer, phone, or product"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <ImportOrdersDialog />
            <Button variant="outline" onClick={exportCsv}>
              <Download aria-hidden="true" />
              Export CSV
            </Button>
            <Button asChild>
              <Link href="/orders/new">
                <Plus aria-hidden="true" />
                Create order
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={status} onValueChange={setStatus} className="mt-4">
          <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto bg-muted/70 p-1">
            {statusFilters.map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="min-h-9 shrink-0 px-3">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-brand/20 bg-brand-muted p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-brand">{selected.size} orders selected</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={printSelected} className="bg-card">
              <Printer aria-hidden="true" />
              Print labels
            </Button>
            <Button variant="outline" onClick={exportManifest} className="bg-card">
              <FileSpreadsheet aria-hidden="true" />
              Export manifest
            </Button>
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching orders"
          description="Try another search or filter, or create a new order."
          actionHref="/orders/new"
          actionLabel="Create order"
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((order) => (
              <article key={order.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selected.has(order.id)}
                    onCheckedChange={() => toggleSelect(order.id)}
                    aria-label={`Select order ${order.id}`}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="font-semibold">{order.customer_name ?? "Unknown customer"}</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">{order.customer_phone ?? "No phone"}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/55 p-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Product</p>
                        <p className="mt-1 font-medium">{order.product_name ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">COD</p>
                        <p className="mt-1 font-semibold tabular-nums">৳{order.cod_amount ?? "—"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/orders/${order.id}`}>View order</Link>
                      </Button>
                      <DeleteOrderButton orderId={order.id} customerName={order.customer_name} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 pl-5">
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
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id} className="h-18">
                    <TableCell className="pl-5">
                      <Checkbox
                        checked={selected.has(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                        aria-label={`Select order ${order.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{order.customer_name ?? "—"}</div>
                      <div className="mt-0.5 text-sm text-muted-foreground">{order.customer_phone ?? "—"}</div>
                    </TableCell>
                    <TableCell>{order.product_name ?? "—"}</TableCell>
                    <TableCell className="font-semibold tabular-nums">৳{order.cod_amount ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/orders/${order.id}`}>View</Link>
                        </Button>
                        <DeleteOrderButton orderId={order.id} customerName={order.customer_name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
