import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types/order";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  missing_info: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  ready_for_courier: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  courier_booked: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  completed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  cancelled: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
};

const STATUS_DOTS: Record<OrderStatus, string> = {
  pending: "bg-slate-500",
  missing_info: "bg-amber-600",
  ready_for_courier: "bg-sky-600",
  courier_booked: "bg-violet-600",
  completed: "bg-emerald-600",
  cancelled: "bg-rose-600",
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
    <Badge className={`${STATUS_STYLES[key] ?? "bg-muted text-foreground"} gap-1.5 border-0 px-2.5 py-1 font-semibold`}>
      <span className={`size-1.5 rounded-full ${STATUS_DOTS[key] ?? "bg-muted-foreground"}`} aria-hidden="true" />
      {STATUS_LABELS[key] ?? status}
    </Badge>
  );
}
