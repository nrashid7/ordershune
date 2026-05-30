"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { encryptSecret } from "@/lib/crypto";
import { resolveCourierConfig } from "@/lib/courier-config";
import { upsertCustomerFromOrder } from "@/lib/customers";
import { createNotification } from "@/lib/notifications";
import { checkOrderLimit } from "@/lib/subscriptions";
import { normalizePhone } from "@/lib/formatting";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string } | null;

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  redirect("/onboarding");
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const phone = normalizePhone(String(formData.get("phone") ?? ""));

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: String(formData.get("full_name") ?? ""),
    shop_name: String(formData.get("shop_name") ?? ""),
    phone,
    default_pickup_address: String(formData.get("default_pickup_address") ?? ""),
    preferred_courier: String(formData.get("preferred_courier") ?? "pathao"),
    default_payment_method: String(formData.get("default_payment_method") ?? "cod"),
    product_category: String(formData.get("product_category") ?? ""),
  });

  if (error) return { error: error.message };

  await supabase.from("whatsapp_sessions").upsert(
    {
      user_id: user.id,
      whatsapp_phone: phone,
      state: "idle",
    },
    { onConflict: "whatsapp_phone" }
  );

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function saveOrder(data: {
  id?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  delivery_area?: string | null;
  product_name?: string | null;
  quantity?: number | null;
  variant?: string | null;
  price?: number | null;
  cod_amount?: number | null;
  payment_status?: string | null;
  delivery_note?: string | null;
  raw_input?: string | null;
  input_type?: string | null;
  extracted_json?: unknown;
  missing_fields?: string[] | null;
  confidence_score?: number | null;
  status?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (!data.id) {
    const limit = await checkOrderLimit(supabase, user.id);
    if (!limit.ok) return { error: limit.error };
  }

  const payload = { ...data, user_id: user.id };

  if (data.id) {
    const { error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", data.id)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
    revalidatePath("/orders");
    revalidatePath(`/orders/${data.id}`);
    return { success: true, id: data.id };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  const customerId = await upsertCustomerFromOrder(supabase, user.id, data);
  if (customerId) {
    await supabase.from("orders").update({ customer_id: customerId }).eq("id", order.id);
  }

  if (data.payment_status === "cod" || data.cod_amount) {
    await supabase.from("cod_entries").upsert(
      {
        user_id: user.id,
        order_id: order.id,
        cod_amount: data.cod_amount ?? 0,
        status: "pending",
      },
      { onConflict: "order_id" }
    );
  }

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/customers");
  return { success: true, id: order.id };
}

export async function deleteOrder(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveCourierIntegration(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const courierName = String(formData.get("courier_name") ?? "");
  const apiKeyInput = String(formData.get("api_key") ?? "");
  const apiSecretInput = String(formData.get("api_secret") ?? "");

  const { data: existing } = await supabase
    .from("courier_integrations")
    .select("api_key_encrypted, api_secret_encrypted")
    .eq("user_id", user.id)
    .eq("courier_name", courierName)
    .maybeSingle();

  const apiKeyEncrypted = apiKeyInput
    ? encryptSecret(apiKeyInput)
    : existing?.api_key_encrypted ?? null;
  const apiSecretEncrypted = apiSecretInput
    ? encryptSecret(apiSecretInput)
    : existing?.api_secret_encrypted ?? null;

  const { error } = await supabase.from("courier_integrations").upsert(
    {
      user_id: user.id,
      courier_name: courierName,
      api_key: null,
      api_secret: null,
      api_key_encrypted: apiKeyEncrypted,
      api_secret_encrypted: apiSecretEncrypted,
      merchant_id: String(formData.get("merchant_id") ?? "") || null,
      pickup_address: String(formData.get("pickup_address") ?? "") || null,
      is_active: formData.get("is_active") === "on",
    },
    { onConflict: "user_id,courier_name" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/settings/courier");
  revalidatePath("/dashboard");
}

export async function createCourierBooking(orderId: string, courierName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) return { error: "Order not found" };

  const { data: integration } = await supabase
    .from("courier_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("courier_name", courierName)
    .maybeSingle();

  const { getCourierAdapter } = await import("@/lib/couriers");
  const adapter = getCourierAdapter(courierName);
  if (!adapter) return { error: "Courier not supported" };

  const config = resolveCourierConfig(integration);
  const result = await adapter.createParcel(order, config);

  if (!result.success) return { error: result.message };

  const { error } = await supabase
    .from("orders")
    .update({
      status: "courier_booked",
      courier_name: courierName,
      courier_status: result.mock ? "mock_booked" : "booked",
      courier_tracking_id: result.trackingId,
      courier_payload: result.payload,
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  await createNotification(supabase, {
    userId: user.id,
    type: "courier",
    title: "Courier booking created",
    body: `Tracking: ${result.trackingId}`,
    orderId,
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true, trackingId: result.trackingId, mock: result.mock };
}

export async function syncOrderStatus(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order?.courier_name) return { error: "No courier booking" };

  const { data: integration } = await supabase
    .from("courier_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("courier_name", order.courier_name)
    .maybeSingle();

  const { syncOrderCourierStatus } = await import("@/lib/courier-sync");
  const result = await syncOrderCourierStatus(supabase, order, integration);

  revalidatePath(`/orders/${orderId}`);
  return { success: true, ...result };
}
