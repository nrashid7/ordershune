"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      void import("@sentry/nextjs").then((Sentry) => {
        Sentry.captureException(error);
      });
    }
  }, [error]);

  return (
    <div className="rounded-lg border bg-background p-8 text-center">
      <h2 className="text-xl font-semibold">Could not load this page</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your session may have expired or the server is temporarily unavailable.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground">Error ID: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={reset}>Retry</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
