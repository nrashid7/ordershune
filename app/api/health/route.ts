import { NextResponse } from "next/server";
import { getLaunchReadiness } from "@/lib/launch-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getLaunchReadiness();

  return NextResponse.json(
    {
      status: report.healthy ? "healthy" : "degraded",
      checks: report.checks,
      productionGaps: report.productionGaps,
      timestamp: new Date().toISOString(),
    },
    { status: report.healthy ? 200 : 503 }
  );
}
