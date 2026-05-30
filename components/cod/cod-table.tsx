"use client";

import { toast } from "sonner";
import { updateCodEntry } from "@/lib/actions/cod";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CodRow = {
  id: string;
  cod_amount: number;
  collected_amount: number | null;
  status: string;
  orders: { id: string; customer_name: string | null; courier_tracking_id: string | null } | null;
};

export function CodTable({ entries }: { entries: CodRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>COD</TableHead>
          <TableHead>Collected</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.orders?.customer_name ?? "—"}</TableCell>
            <TableCell>৳{entry.cod_amount}</TableCell>
            <TableCell>৳{entry.collected_amount ?? "—"}</TableCell>
            <TableCell className="capitalize">{entry.status}</TableCell>
            <TableCell className="flex gap-2">
              {entry.status === "pending" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const r = await updateCodEntry(entry.id, {
                      status: "collected",
                      collected_amount: Number(entry.cod_amount),
                    });
                    if (r.error) toast.error(r.error);
                    else toast.success("Marked collected");
                  }}
                >
                  Collected
                </Button>
              ) : null}
              {entry.status === "collected" ? (
                <Button
                  size="sm"
                  onClick={async () => {
                    const r = await updateCodEntry(entry.id, { status: "reconciled" });
                    if (r.error) toast.error(r.error);
                    else toast.success("Reconciled");
                  }}
                >
                  Reconcile
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
