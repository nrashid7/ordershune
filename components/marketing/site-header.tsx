import Link from "next/link";
import { AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  showPricing?: boolean;
  showLogin?: boolean;
  showSignup?: boolean;
};

export function SiteHeader({
  showPricing = true,
  showLogin = true,
  showSignup = true,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/75 bg-background/92 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5 rounded-xl font-heading text-xl font-extrabold tracking-[-0.035em] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background">
            <AudioLines className="size-5" aria-hidden="true" />
          </span>
          OrderShune
        </Link>
        <nav aria-label="Marketing navigation" className="flex items-center gap-1 sm:gap-2">
          {showPricing ? (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/pricing">Pricing</Link>
            </Button>
          ) : null}
          {showLogin ? (
            <Button asChild variant="ghost">
              <Link href="/login">Log in</Link>
            </Button>
          ) : null}
          {showSignup ? (
            <Button asChild>
              <Link href="/signup">Start free</Link>
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
