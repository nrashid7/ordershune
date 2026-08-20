#!/usr/bin/env node
/**
 * Launch readiness scanner for CI / local ops.
 * Does not print secret values — only presence and remote health.
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CREDENTIALS_ENCRYPTION_KEY",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const eitherOr = [["META_APP_SECRET", "WHATSAPP_APP_SECRET"]];

const missing = required.filter((key) => !process.env[key]?.trim());
for (const group of eitherOr) {
  if (!group.some((key) => process.env[key]?.trim())) {
    missing.push(group.join(" or "));
  }
}

const baseUrl = (process.env.CHECK_LAUNCH_URL || process.env.NEXT_PUBLIC_APP_URL || "")
  .trim()
  .replace(/\/$/, "");

console.log("OrderShune launch check");
console.log("-----------------------");
if (missing.length) {
  console.log("Missing env:");
  for (const key of missing) console.log(`  - ${key}`);
} else {
  console.log("Required env: present");
}

if (!baseUrl) {
  console.log("Health URL: skipped (set CHECK_LAUNCH_URL or NEXT_PUBLIC_APP_URL)");
  process.exit(missing.length ? 1 : 0);
}

try {
  const res = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
  const body = await res.json();
  console.log(`Health (${baseUrl}): HTTP ${res.status} → ${body.status}`);
  if (body.productionGaps?.length) {
    console.log("Production gaps:");
    for (const gap of body.productionGaps) console.log(`  - ${gap}`);
  }
  if (body.checks) {
    console.log("Checks:", JSON.stringify(body.checks));
  }
  const ok = res.ok && body.status === "healthy" && missing.length === 0;
  process.exit(ok ? 0 : 1);
} catch (error) {
  console.log(`Health fetch failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
