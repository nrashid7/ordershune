"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CSV_HEADERS } from "@/lib/formatting";

export function ImportOrdersDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState(`${CSV_HEADERS}\n`);
  const [loading, setLoading] = useState(false);

  async function importCsv() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Imported ${data.imported} orders`);
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk import orders</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Paste CSV with headers: customer_name, customer_phone, customer_address, product_name,
          quantity, cod_amount
        </p>
        <Textarea className="min-h-[200px] font-mono text-xs" value={csv} onChange={(e) => setCsv(e.target.value)} />
        <Button onClick={importCsv} disabled={loading}>
          {loading ? "Importing..." : "Import"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
