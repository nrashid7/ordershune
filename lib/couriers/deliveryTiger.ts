import { courierFetch, mapCourierStatus } from "./http";
import type { CourierAdapter } from "./types";
import { createMockAdapter } from "./types";

const BASE = "https://api.deliverytiger.com.bd/api/v1";
const mock = createMockAdapter("delivery_tiger");

export const deliveryTigerAdapter: CourierAdapter = {
  name: "delivery_tiger",
  async createParcel(order, config) {
    if (!config.api_key) return mock.createParcel(order, config);

    const res = await courierFetch(`${BASE}/parcel/create`, {
      method: "POST",
      apiKey: config.api_key,
      body: JSON.stringify({
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        cod_amount: order.cod_amount ?? order.price,
        product_details: order.product_name,
        quantity: order.quantity ?? 1,
        note: order.delivery_note,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        parcelId: "",
        trackingId: "",
        message: data?.message ?? "Delivery Tiger API error",
        mock: false,
        payload: data,
      };
    }
    const trackingId = String(data.tracking_id ?? data.id ?? "");
    return {
      success: true,
      parcelId: trackingId,
      trackingId,
      message: "Delivery Tiger parcel created",
      mock: false,
      payload: data,
    };
  },
  async getStatus(parcelId, config) {
    if (!config.api_key) return mock.getStatus(parcelId, config);
    const res = await courierFetch(`${BASE}/parcel/${parcelId}/status`, {
      method: "GET",
      apiKey: config.api_key,
    });
    const data = await res.json().catch(() => ({}));
    const raw = String(data.status ?? "unknown");
    return {
      success: res.ok,
      status: mapCourierStatus(raw),
      message: raw,
      mock: false,
    };
  },
  async cancelParcel(parcelId, config) {
    if (!config.api_key) return mock.cancelParcel(parcelId, config);
    return mock.cancelParcel(parcelId, config);
  },
  async calculateCharge(order, config) {
    if (!config.api_key) return mock.calculateCharge(order, config);
    return mock.calculateCharge(order, config);
  },
};
