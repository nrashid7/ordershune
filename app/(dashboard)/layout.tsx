import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SkipLink } from "@/components/ui/skip-link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <SkipLink />
      <DashboardShell>
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </DashboardShell>
    </div>
  );
}
