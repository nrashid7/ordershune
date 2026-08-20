import Link from "next/link";
import { AudioLines, Check } from "lucide-react";
import { SkipLink } from "@/components/ui/skip-link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <SkipLink />
      <aside className="relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
        <div className="app-grid absolute inset-0 opacity-10" aria-hidden="true" />
        <Link href="/" className="relative flex items-center gap-2.5 font-heading text-xl font-extrabold">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-300 text-emerald-950">
            <AudioLines className="size-5" aria-hidden="true" />
          </span>
          OrderShune
        </Link>
        <div className="relative max-w-xl py-16">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Sell more. Copy less.</p>
          <h1 className="mt-5 font-heading text-5xl font-bold leading-[1.08] tracking-[-0.04em]">
            Every order, clean and ready to ship.
          </h1>
          <p className="mt-6 text-lg leading-8 text-background/70">
            One workspace for social conversations, structured orders, couriers, and COD follow-up.
          </p>
          <div className="mt-10 space-y-4">
            {["Understands Bangla, Banglish, and English", "Connects your social selling channels", "Works with leading Bangladesh couriers"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-background/90">
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-300 text-emerald-950">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  {item}
                </div>
              )
            )}
          </div>
        </div>
        <p className="relative text-sm text-background/50">Built for Bangladesh&apos;s growing commerce teams.</p>
      </aside>

      <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="mb-8 flex min-h-11 items-center gap-2.5 self-start rounded-xl font-heading text-lg font-extrabold lg:hidden"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background">
            <AudioLines className="size-5" aria-hidden="true" />
          </span>
          OrderShune
        </Link>
        <main id="main-content" className="flex flex-1 items-center justify-center py-8">
          {children}
        </main>
        <p className="text-center text-xs text-muted-foreground lg:text-right">
          Secure account access · Need help? support@ordershune.com
        </p>
      </div>
    </div>
  );
}
