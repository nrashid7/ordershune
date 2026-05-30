"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCodEntry(
  id: string,
  data: { status: string; collected_amount?: number; notes?: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: Record<string, unknown> = {
    status: data.status,
    notes: data.notes ?? null,
  };

  if (data.collected_amount != null) {
    updates.collected_amount = data.collected_amount;
    updates.collected_at = new Date().toISOString();
  }
  if (data.status === "reconciled") {
    updates.reconciled_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("cod_entries")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/cod");
  return { success: true };
}

export async function createCodFromOrder(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: order } = await supabase
    .from("orders")
    .select("cod_amount, payment_status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) return { error: "Order not found" };
  if (order.payment_status !== "cod" && !order.cod_amount) {
    return { error: "Not a COD order" };
  }

  const { error } = await supabase.from("cod_entries").upsert(
    {
      user_id: user.id,
      order_id: orderId,
      cod_amount: order.cod_amount ?? 0,
      status: "pending",
    },
    { onConflict: "order_id" }
  );

  if (error) return { error: error.message };
  revalidatePath("/cod");
  return { success: true };
}
