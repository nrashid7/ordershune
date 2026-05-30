import type { Profile } from "@/lib/types/order";
import { generateCourierFormat, generateOrderSummary } from "@/lib/formatting";
import { sendWhatsAppMessage } from "./client";

export const HELP_TEXT = `OrderShune Commands:
- Send a customer message, screenshot, or voice note to extract an order
- confirm or 1 — save order
- format or 3 — courier format
- orders — recent orders
- help — this message
- cancel or 4 — discard draft`;

export async function handleCommand(
  command: string,
  context: {
    phone: string;
    userId: string;
    lastOrderId?: string | null;
    getOrder: (id: string) => Promise<Record<string, unknown> | null>;
    confirmOrder: (id: string) => Promise<void>;
    cancelDraft: () => Promise<void>;
    listOrders: () => Promise<Array<Record<string, unknown>>>;
    getProfile: () => Promise<Pick<Profile, "default_pickup_address"> | null>;
  }
): Promise<string> {
  const normalized = command.trim().toLowerCase();

  if (normalized === "help") return HELP_TEXT;

  if (normalized === "orders") {
    const orders = await context.listOrders();
    if (orders.length === 0) return "No orders found yet.";
    return orders
      .slice(0, 5)
      .map(
        (order, index) =>
          `${index + 1}. ${order.customer_name ?? "Unknown"} — ${order.product_name ?? "Product"} (${order.status})`
      )
      .join("\n");
  }

  if (!context.lastOrderId) {
    return "No draft order. Send a customer message to extract an order first.";
  }

  const order = await context.getOrder(context.lastOrderId);
  if (!order) return "Draft order not found.";

  if (["confirm", "1"].includes(normalized)) {
    await context.confirmOrder(context.lastOrderId);
    return "✅ Order saved and marked ready for courier processing.";
  }

  if (["format", "3"].includes(normalized)) {
    const profile = await context.getProfile();
    return generateCourierFormat(order, profile);
  }

  if (["cancel", "4"].includes(normalized)) {
    await context.cancelDraft();
    return "Draft order cancelled.";
  }

  if (normalized === "2" || normalized === "edit") {
    return "Edit via web dashboard for now: /orders/" + context.lastOrderId;
  }

  return HELP_TEXT;
}

export async function replyWithSummary(
  phone: string,
  summary: string
): Promise<void> {
  await sendWhatsAppMessage(phone, summary);
}

export async function replyWithOrderSummary(order: Record<string, unknown>) {
  return generateOrderSummary(order);
}
