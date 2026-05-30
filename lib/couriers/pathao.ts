import { courierFetch, mapCourierStatus } from "./http";
import type { CourierAdapter } from "./types";
import { createMockAdapter } from "./types";

const BASE = "https://api-hermes.pathao.com";
const mock = createMockAdapter("pathao");

async function getPathaoToken(config: {
  api_key?: string | null;
  api_secret?: string | null;
}): Promise<string | null> {
  if (!config.api_key || !config.api_secret) return null;
  const res = await fetch(`${BASE}/aladdin/api/v1/issue-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.api_key,
      client_secret: config.api_secret,
      grant_type: "password",
      username: process.env.PATHAO_USERNAME ?? "",
      password: process.env.PATHAO_PASSWORD ?? "",
    }),
  });
  const data = await res.json().catch(() => ({}));
  return data.access_token ?? null;
}

function hasCreds(config: { api_key?: string | null; api_secret?: string | null }) {
  return Boolean(config.api_key && config.api_secret);
}

export const pathaoAdapter: CourierAdapter = {
  name: "pathao",
  async createParcel(order, config) {
    if (!hasCreds(config)) return mock.createParcel(order, config);

    const token = await getPathaoToken(config);
    if (!token) {
      return {
        success: false,
        parcelId: "",
        trackingId: "",
        message: "Pathao auth failed — check PATHAO_USERNAME/PATHAO_PASSWORD",
        mock: false,
        payload: {},
      };
    }

    const body = {
      store_id: config.merchant_id,
      merchant_order_id: order.id,
      recipient_name: order.customer_name,
      recipient_phone: order.customer_phone,
      recipient_address: order.customer_address,
      recipient_city: order.delivery_area?.includes("Dhaka") ? 1 : 2,
      recipient_zone: 1,
      recipient_area: 1,
      delivery_type: 48,
      item_type: 2,
      item_quantity: order.quantity ?? 1,
      item_weight: 0.5,
      amount_to_collect: Number(order.cod_amount ?? order.price ?? 0),
      item_description: order.product_name,
    };

    const res = await courierFetch(`${BASE}/aladdin/api/v1/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        parcelId: "",
        trackingId: "",
        message: data?.message ?? "Pathao API error",
        mock: false,
        payload: data,
      };
    }
    const trackingId = String(data.data?.consignment_id ?? data.consignment_id ?? "");
    return {
      success: true,
      parcelId: trackingId,
      trackingId,
      message: "Pathao parcel created",
      mock: false,
      payload: data,
    };
  },
  async getStatus(parcelId, config) {
    if (!hasCreds(config)) return mock.getStatus(parcelId, config);
    const token = await getPathaoToken(config);
    if (!token) return mock.getStatus(parcelId, config);
    const res = await courierFetch(`${BASE}/aladdin/api/v1/orders/${parcelId}/info`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    const raw = String(data.data?.order_status ?? data.order_status ?? "unknown");
    return {
      success: res.ok,
      status: mapCourierStatus(raw),
      message: raw,
      mock: false,
    };
  },
  async cancelParcel(parcelId, config) {
    if (!hasCreds(config)) return mock.cancelParcel(parcelId, config);
    return mock.cancelParcel(parcelId, config);
  },
  async calculateCharge(order, config) {
    if (!hasCreds(config)) return mock.calculateCharge(order, config);
    const base = order.delivery_area?.toLowerCase().includes("dhaka") ? 70 : 130;
    return {
      success: true,
      charge: base,
      currency: "BDT",
      message: "Pathao estimated delivery charge",
      mock: false,
    };
  },
};
