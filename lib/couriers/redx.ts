import { courierFetch, mapCourierStatus } from "./http";
import type { CourierAdapter } from "./types";
import { createMockAdapter } from "./types";

const BASE = "https://api.redx.com.bd/v1";
const mock = createMockAdapter("redx");

function hasCreds(config: { api_key?: string | null }) {
  return Boolean(config.api_key);
}

export const redxAdapter: CourierAdapter = {
  name: "redx",
  async createParcel(order, config) {
    if (!hasCreds(config)) return mock.createParcel(order, config);

    const body = {
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      delivery_area: order.delivery_area,
      parcel_weight: 500,
      cash_collection_amount: Number(order.cod_amount ?? order.price ?? 0),
      value: Number(order.price ?? order.cod_amount ?? 0),
      instruction: order.delivery_note,
      parcel_details_json: [{ name: order.product_name, quantity: order.quantity ?? 1 }],
    };

    const res = await courierFetch(`${BASE}/parcel`, {
      method: "POST",
      apiKey: config.api_key!,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        parcelId: "",
        trackingId: "",
        message: data?.message ?? "REDX API error",
        mock: false,
        payload: data,
      };
    }
    const trackingId = String(data.tracking_id ?? data.trackingId ?? data.id ?? "");
    return {
      success: true,
      parcelId: trackingId,
      trackingId,
      message: "REDX parcel created",
      mock: false,
      payload: data,
    };
  },
  async getStatus(parcelId, config) {
    if (!hasCreds(config)) return mock.getStatus(parcelId, config);
    const res = await courierFetch(`${BASE}/parcel/${parcelId}`, {
      method: "GET",
      apiKey: config.api_key!,
    });
    const data = await res.json().catch(() => ({}));
    const raw = String(data.status ?? data.delivery_status ?? "unknown");
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
    const base = order.delivery_area?.toLowerCase().includes("dhaka") ? 60 : 110;
    return {
      success: true,
      charge: base,
      currency: "BDT",
      message: "REDX estimated (configure full pricing API when available)",
      mock: false,
    };
  },
};
