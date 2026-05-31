import Link from "next/link";
import { SkipLink } from "@/components/ui/skip-link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <SkipLink />
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
        <Link
          href="/"
          className="mb-8 text-center text-xl font-bold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          OrderShune
        </Link>
        <main id="main-content" className="flex flex-1 flex-col justify-center">
          {children}
        </main>
      </div>
    </div>
  );
}
