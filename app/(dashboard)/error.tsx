"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border bg-background p-8 text-center">
      <h2 className="text-xl font-semibold">Could not load this page</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your session may have expired or the server is temporarily unavailable.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={reset}>Retry</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
