export async function register() {
  if (
    process.env.NEXT_RUNTIME !== "nodejs" ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return;
  }

  const { validateEnv } = await import("./lib/env");
  validateEnv();

  // Optional: npm install @sentry/nextjs and add Sentry.init in sentry.client.config.ts
}
