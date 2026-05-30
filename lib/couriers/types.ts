import type { OrderRecord } from "@/lib/types/order";

export interface CourierConfig {
  api_key?: string | null;
  api_secret?: string | null;
  merchant_id?: string | null;
  pickup_address?: string | null;
}

export interface ParcelResult {
  success: boolean;
  parcelId: string;
  trackingId: string;
  message: string;
  mock: boolean;
  payload: Record<string, unknown>;
}

export interface StatusResult {
  success: boolean;
  status: string;
  message: string;
  mock: boolean;
}

export interface CancelResult {
  success: boolean;
  message: string;
  mock: boolean;
}

export interface ChargeResult {
  success: boolean;
  charge: number;
  currency: string;
  message: string;
  mock: boolean;
}

export interface CourierAdapter {
  name: string;
  createParcel(order: OrderRecord, config: CourierConfig): Promise<ParcelResult>;
  getStatus(parcelId: string, config: CourierConfig): Promise<StatusResult>;
  cancelParcel(parcelId: string, config: CourierConfig): Promise<CancelResult>;
  calculateCharge(order: OrderRecord, config: CourierConfig): Promise<ChargeResult>;
}

function hasCredentials(config: CourierConfig): boolean {
  return Boolean(config.api_key || config.api_secret || config.merchant_id);
}

function buildPayload(order: OrderRecord, config: CourierConfig) {
  return {
    recipient_name: order.customer_name,
    recipient_phone: order.customer_phone,
    recipient_address: order.customer_address,
    delivery_area: order.delivery_area,
    item_description: order.product_name,
    quantity: order.quantity,
    cod_amount: order.cod_amount ?? order.price,
    pickup_address: config.pickup_address,
  };
}

export function createMockAdapter(name: string): CourierAdapter {
  return {
    name,
    async createParcel(order, config) {
      const mock = !hasCredentials(config);
      const trackingId = `${name.toUpperCase()}-MOCK-${Date.now()}`;
      return {
        success: true,
        parcelId: trackingId,
        trackingId,
        message: mock
          ? `Mock parcel created for ${name}`
          : `${name} parcel created (real API placeholder)`,
        mock,
        payload: buildPayload(order, config),
      };
    },
    async getStatus(parcelId, config) {
      return {
        success: true,
        status: "in_transit",
        message: hasCredentials(config)
          ? `Status for ${parcelId} (real API placeholder)`
          : `Mock status for ${parcelId}`,
        mock: !hasCredentials(config),
      };
    },
    async cancelParcel(parcelId, config) {
      return {
        success: true,
        message: hasCredentials(config)
          ? `Cancelled ${parcelId} (real API placeholder)`
          : `Mock cancelled ${parcelId}`,
        mock: !hasCredentials(config),
      };
    },
    async calculateCharge(order, config) {
      const base = order.delivery_area?.toLowerCase().includes("dhaka") ? 60 : 120;
      return {
        success: true,
        charge: base + Number(order.cod_amount ?? 0) * 0.01,
        currency: "BDT",
        message: hasCredentials(config)
          ? "Estimated charge (real API placeholder)"
          : "Mock estimated charge",
        mock: !hasCredentials(config),
      };
    },
  };
}

