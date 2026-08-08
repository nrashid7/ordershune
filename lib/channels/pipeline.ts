import { extractOrder } from "@/lib/ai/extract-order";
import { upsertCustomerFromOrder } from "@/lib/customers";
import { deriveOrderStatus } from "@/lib/formatting";
import { checkOrderLimit } from "@/lib/subscriptions";
import type { ExtractedOrder, InputType, OrderRecord } from "@/lib/types/order";
import { dbOrderToRecord } from "@/lib/types/order";
import { toJson } from "@/lib/types/database";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getOrganizationId(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .maybeSingle();
  return data?.organization_id ?? null;
}

export function mergeExtractedFields(
  existing: Partial<OrderRecord>,
  extracted: ExtractedOrder
): ExtractedOrder {
  const pick = <T>(prev: T | null | undefined, next: T | null | undefined): T | null =>
    prev != null && prev !== "" ? prev : (next ?? null);

  const merged: ExtractedOrder = {
    customer_name: pick(existing.customer_name, extracted.customer_name),
    customer_phone: pick(existing.customer_phone, extracted.customer_phone),
    customer_address: pick(existing.customer_address, extracted.customer_address),
    delivery_area: pick(existing.delivery_area, extracted.delivery_area),
    product_name: pick(existing.product_name, extracted.product_name),
    quantity: pick(existing.quantity, extracted.quantity),
    variant: pick(existing.variant, extracted.variant),
    price: pick(existing.price, extracted.price),
    cod_amount: pick(existing.cod_amount, extracted.cod_amount),
    payment_status:
      extracted.payment_status !== "unknown"
        ? extracted.payment_status
        : ((existing.payment_status as ExtractedOrder["payment_status"]) ?? "unknown"),
    delivery_note: pick(existing.delivery_note, extracted.delivery_note),
    missing_fields: [],
    confidence_score: Math.max(
      extracted.confidence_score ?? 0,
      existing.confidence_score ?? 0
    ),
    notes: [
      ...((existing.extracted_json as ExtractedOrder | null)?.notes ?? []),
      ...extracted.notes,
    ],
  };

  const required: Array<keyof ExtractedOrder> = [
    "customer_name",
    "customer_phone",
    "customer_address",
    "product_name",
    "quantity",
    "cod_amount",
  ];

  merged.missing_fields = required.filter((field) => {
    const value = merged[field];
    return value == null || value === "";
  }) as string[];

  return merged;
}

export async function ingestMessage(
  userId: string,
  inputType: InputType,
  rawText: string,
  organizationId?: string | null
): Promise<OrderRecord> {
  const admin = createAdminClient();
  const limit = await checkOrderLimit(admin, userId);
  if (!limit.ok) {
    throw new Error(limit.error ?? "Order limit reached");
  }

  const extracted = await extractOrder(rawText, inputType);
  const status = deriveOrderStatus(extracted);
  const orgId = organizationId ?? (await getOrganizationId(userId));

  const { data: order, error } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      organization_id: orgId,
      customer_name: extracted.customer_name,
      customer_phone: extracted.customer_phone,
      customer_address: extracted.customer_address,
      delivery_area: extracted.delivery_area,
      product_name: extracted.product_name,
      quantity: extracted.quantity,
      variant: extracted.variant,
      price: extracted.price,
      cod_amount: extracted.cod_amount,
      payment_status: extracted.payment_status,
      delivery_note: extracted.delivery_note,
      raw_input: rawText,
      input_type: inputType,
      extracted_json: toJson(extracted),
      missing_fields: extracted.missing_fields,
      confidence_score: extracted.confidence_score,
      status,
    })
    .select("*")
    .single();

  if (error || !order) {
    throw new Error(error?.message ?? "Failed to save draft order");
  }

  const customerId = await upsertCustomerFromOrder(admin, userId, extracted, orgId);
  if (customerId) {
    await admin.from("orders").update({ customer_id: customerId }).eq("id", order.id);
  }

  if (extracted.payment_status === "cod" || extracted.cod_amount) {
    await admin.from("cod_entries").upsert(
      {
        user_id: userId,
        order_id: order.id,
        cod_amount: extracted.cod_amount ?? 0,
        status: "pending",
      },
      { onConflict: "order_id" }
    );
  }

  return dbOrderToRecord(order);
}

export async function mergeIntoDraft(
  orderId: string,
  userId: string,
  inputType: InputType,
  rawText: string
): Promise<OrderRecord> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    throw new Error("Draft order not found");
  }

  const newExtracted = await extractOrder(rawText, inputType);
  const merged = mergeExtractedFields(dbOrderToRecord(existing), newExtracted);
  const status = deriveOrderStatus(merged);

  const { data: order, error } = await admin
    .from("orders")
    .update({
      customer_name: merged.customer_name,
      customer_phone: merged.customer_phone,
      customer_address: merged.customer_address,
      delivery_area: merged.delivery_area,
      product_name: merged.product_name,
      quantity: merged.quantity,
      variant: merged.variant,
      price: merged.price,
      cod_amount: merged.cod_amount,
      payment_status: merged.payment_status,
      delivery_note: merged.delivery_note,
      raw_input: `${existing.raw_input ?? ""}\n---\n${rawText}`.slice(0, 4000),
      input_type: inputType,
      extracted_json: toJson(merged),
      missing_fields: merged.missing_fields,
      confidence_score: merged.confidence_score,
      status,
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error || !order) {
    throw new Error(error?.message ?? "Failed to merge draft order");
  }

  const customerId = await upsertCustomerFromOrder(
    admin,
    userId,
    merged,
    (existing as { organization_id?: string | null }).organization_id
  );
  if (customerId) {
    await admin.from("orders").update({ customer_id: customerId }).eq("id", order.id);
  }

  if (merged.payment_status === "cod" || merged.cod_amount) {
    await admin.from("cod_entries").upsert(
      {
        user_id: userId,
        order_id: order.id,
        cod_amount: merged.cod_amount ?? 0,
        status: "pending",
      },
      { onConflict: "order_id" }
    );
  }

  return dbOrderToRecord(order);
}

export async function findOpenDraftOrder(
  userId: string,
  orderId: string | null
): Promise<OrderRecord | null> {
  if (!orderId) return null;

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .in("status", ["pending", "missing_info"])
    .gte("created_at", cutoff)
    .maybeSingle();

  return data ? dbOrderToRecord(data) : null;
}

export async function logChannelMessage(params: {
  userId: string;
  conversationId?: string | null;
  channel: string;
  direction: "inbound" | "outbound";
  senderId?: string | null;
  messageText?: string | null;
  messageType?: string;
  commentId?: string | null;
  postId?: string | null;
  orderId?: string | null;
  rawPayload?: unknown;
}) {
  const admin = createAdminClient();
  await admin.from("channel_messages").insert({
    user_id: params.userId,
    conversation_id: params.conversationId ?? null,
    channel: params.channel,
    direction: params.direction,
    sender_id: params.senderId ?? null,
    message_text: params.messageText ?? null,
    message_type: params.messageType ?? "text",
    comment_id: params.commentId ?? null,
    post_id: params.postId ?? null,
    order_id: params.orderId ?? null,
    raw_payload: params.rawPayload != null ? toJson(params.rawPayload) : null,
  });
}

export async function upsertConversation(params: {
  userId: string;
  channel: string;
  pageId: string;
  senderId: string;
  senderName?: string | null;
  lastMessage: string;
  lastOrderId?: string | null;
  state?: string;
}): Promise<string> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("channel_conversations")
    .upsert(
      {
        user_id: params.userId,
        channel: params.channel,
        page_id: params.pageId,
        sender_id: params.senderId,
        sender_name: params.senderName ?? null,
        last_message: params.lastMessage.slice(0, 500),
        last_order_id: params.lastOrderId ?? null,
        state: params.state ?? "draft",
      },
      { onConflict: "channel,page_id,sender_id" }
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to upsert conversation");
  }

  return data.id;
}
