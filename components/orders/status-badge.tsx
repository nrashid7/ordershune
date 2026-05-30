import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types/order";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-slate-100 text-slate-800",
  missing_info: "bg-amber-100 text-amber-900",
  ready_for_courier: "bg-blue-100 text-blue-900",
  courier_booked: "bg-indigo-100 text-indigo-900",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  missing_info: "Missing Info",
  ready_for_courier: "Ready",
  courier_booked: "Booked",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status as OrderStatus;
  return (
    <Badge className={STATUS_STYLES[key] ?? "bg-muted text-foreground"}>
      {STATUS_LABELS[key] ?? status}
    </Badge>
  );
}
