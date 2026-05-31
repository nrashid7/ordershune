import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SkipLink } from "@/components/ui/skip-link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <SkipLink />
      <DashboardShell>
        <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
      </DashboardShell>
    </div>
  );
}
