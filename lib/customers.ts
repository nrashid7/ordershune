import { normalizePhone } from "@/lib/formatting";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function upsertCustomerFromOrder(
  supabase: SupabaseClient,
  userId: string,
  order: {
    customer_phone?: string | null;
    customer_name?: string | null;
    customer_address?: string | null;
    delivery_area?: string | null;
    cod_amount?: number | null;
  }
): Promise<string | null> {
  if (!order.customer_phone) return null;

  const phone = normalizePhone(order.customer_phone);
  const { data: existing } = await supabase
    .from("customers")
    .select("id, order_count, total_cod")
    .eq("user_id", userId)
    .eq("phone", phone)
    .maybeSingle();

  const cod = Number(order.cod_amount ?? 0);

  if (existing) {
    await supabase
      .from("customers")
      .update({
        name: order.customer_name ?? undefined,
        address: order.customer_address ?? undefined,
        delivery_area: order.delivery_area ?? undefined,
        order_count: (existing.order_count ?? 0) + 1,
        total_cod: Number(existing.total_cod ?? 0) + cod,
        last_order_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return existing.id;
  }

  const { data: created } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      phone,
      name: order.customer_name,
      address: order.customer_address,
      delivery_area: order.delivery_area,
      order_count: 1,
      total_cod: cod,
      last_order_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  return created?.id ?? null;
}
