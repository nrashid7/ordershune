import { courierFetch, mapCourierStatus } from "./http";
import type { CourierAdapter, CourierConfig } from "./types";
import { createMockAdapter } from "./types";

const BASE = "https://portal.steadfast.com.bd/api/v1";
const mock = createMockAdapter("steadfast");

function hasCreds(config: CourierConfig) {
  return Boolean(config.api_secret);
}

export const steadfastAdapter: CourierAdapter = {
  name: "steadfast",
  async createParcel(order, config) {
    if (!hasCreds(config)) return mock.createParcel(order, config);

    const body = {
      invoice: order.id.slice(0, 8),
      recipient_name: order.customer_name,
      recipient_phone: order.customer_phone,
      recipient_address: [order.customer_address, order.delivery_area].filter(Boolean).join(", "),
      cod_amount: Number(order.cod_amount ?? order.price ?? 0),
      note: order.delivery_note ?? "",
      item_description: order.product_name,
      quantity: order.quantity ?? 1,
    };

    const res = await courierFetch(`${BASE}/create_order`, {
      method: "POST",
      apiSecret: config.api_secret!,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        parcelId: "",
        trackingId: "",
        message: data?.message ?? "Steadfast API error",
        mock: false,
        payload: data,
      };
    }

    const trackingId = String(data.consignment_id ?? data.tracking_code ?? data.id ?? "");
    return {
      success: true,
      parcelId: trackingId,
      trackingId,
      message: "Steadfast parcel created",
      mock: false,
      payload: data,
    };
  },
  async getStatus(parcelId, config) {
    if (!hasCreds(config)) return mock.getStatus(parcelId, config);
    const res = await courierFetch(`${BASE}/status_by_cid/${parcelId}`, {
      method: "GET",
      apiSecret: config.api_secret!,
    });
    const data = await res.json().catch(() => ({}));
    const raw = String(data.delivery_status ?? data.status ?? "unknown");
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
    return mock.calculateCharge(order, config);
  },
};
