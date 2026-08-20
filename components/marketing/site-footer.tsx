import Link from "next/link";
import { AudioLines } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_0.6fr_0.6fr] lg:px-10">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5 font-heading text-lg font-extrabold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background">
              <AudioLines className="size-5" aria-hidden="true" />
            </span>
            OrderShune
          </Link>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The order operations workspace built for Bangladesh&apos;s Facebook, Instagram, and WhatsApp sellers.
          </p>
        </div>
        <div>
          <p className="font-heading text-sm font-bold">Product</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <Link href="/#how-it-works" className="hover:text-foreground">How it works</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/login" className="hover:text-foreground">Log in</Link>
          </div>
        </div>
        <div>
          <p className="font-heading text-sm font-bold">Company</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <a href="mailto:support@ordershune.com" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-muted-foreground sm:px-8 lg:px-10">
          © {new Date().getFullYear()} OrderShune. Built with care for Bangladeshi sellers.
        </p>
      </div>
    </footer>
  );
}
