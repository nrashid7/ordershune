import { decryptSecret } from "@/lib/crypto";
import type { CourierConfig } from "@/lib/couriers/types";

type IntegrationRow = {
  api_key?: string | null;
  api_secret?: string | null;
  api_key_encrypted?: string | null;
  api_secret_encrypted?: string | null;
  merchant_id?: string | null;
  pickup_address?: string | null;
};

export function resolveCourierConfig(integration: IntegrationRow | null): CourierConfig {
  if (!integration) return {};

  const key =
    decryptSecret(integration.api_key_encrypted) ??
    integration.api_key ??
    null;
  const secret =
    decryptSecret(integration.api_secret_encrypted) ??
    integration.api_secret ??
    null;

  return {
    api_key: key,
    api_secret: secret,
    merchant_id: integration.merchant_id,
    pickup_address: integration.pickup_address,
  };
}
