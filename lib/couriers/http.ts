export async function courierFetch(
  url: string,
  options: RequestInit & { apiKey?: string; apiSecret?: string }
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.apiKey) headers.set("Authorization", `Bearer ${options.apiKey}`);
  if (options.apiSecret) headers.set("Api-Key", options.apiSecret);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  return fetch(url, {
    ...options,
    headers,
  });
}

export function mapCourierStatus(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("deliver")) return "delivered";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("return")) return "returned";
  if (s.includes("transit") || s.includes("hub") || s.includes("pick")) return "in_transit";
  return "booked";
}
