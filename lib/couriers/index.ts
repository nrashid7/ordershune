import type { CourierName } from "@/lib/types/order";
import { deliveryTigerAdapter } from "./deliveryTiger";
import { pathaoAdapter } from "./pathao";
import { redxAdapter } from "./redx";
import { steadfastAdapter } from "./steadfast";
import type { CourierAdapter } from "./types";

const registry: Record<CourierName, CourierAdapter> = {
  pathao: pathaoAdapter,
  redx: redxAdapter,
  steadfast: steadfastAdapter,
  delivery_tiger: deliveryTigerAdapter,
};

export function getCourierAdapter(name: string): CourierAdapter | null {
  return registry[name as CourierName] ?? null;
}

export function listCourierAdapters(): CourierAdapter[] {
  return Object.values(registry);
}

export * from "./types";
