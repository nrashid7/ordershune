import Link from "next/link";
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
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
      <Link href="/" className="text-xl font-bold text-brand">
        OrderShune
      </Link>
      <div className="flex gap-2">
        {showPricing ? (
          <Button asChild variant="ghost">
            <Link href="/pricing">Pricing</Link>
          </Button>
        ) : null}
        {showLogin ? (
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
        ) : null}
        {showSignup ? (
          <Button asChild>
            <Link href="/signup">Start free</Link>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
