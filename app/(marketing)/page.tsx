import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  Headphones,
  Image as ImageIcon,
  MessageCircle,
  PackageCheck,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Capture every order",
    description:
      "Bring WhatsApp, Facebook, and Instagram conversations into one calm inbox.",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Let AI structure the details",
    description:
      "OrderShune reads Bangla, Banglish, screenshots, and voice notes—then flags what is missing.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Send it to your courier",
    description:
      "Prepare bookings, labels, and manifests for the couriers your business already uses.",
    icon: Truck,
  },
];

const capabilities = [
  { icon: MessageCircle, label: "Text messages" },
  { icon: ImageIcon, label: "Order screenshots" },
  { icon: Headphones, label: "Bangla voice notes" },
  { icon: Users, label: "Team handoffs" },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="app-grid absolute inset-0 opacity-35" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-muted px-3 py-1.5 text-sm font-semibold text-brand">
              <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
              Built for Bangladesh&apos;s social sellers
            </div>
            <h1 className="font-heading text-5xl font-bold leading-[1.04] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
              From customer chat to courier-ready order.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              OrderShune turns messy messages, screenshots, and voice notes into clean orders—so
              you can ship faster and spend less time copying details.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start free <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {["50 orders free", "No card required", "Bangla-ready"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CircleCheck className="size-4 text-brand" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-muted/70" />
            <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_24px_70px_rgba(18,48,35,0.16)]">
              <div className="flex items-center justify-between border-b bg-foreground px-5 py-4 text-background">
                <div>
                  <p className="text-sm font-semibold">New WhatsApp order</p>
                  <p className="mt-0.5 text-xs text-background/60">Mirpur Boutique · just now</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-background/75">
                  <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  Live
                </span>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[0.9fr_1.1fr] sm:p-6">
                <div className="space-y-3">
                  <div className="rounded-2xl rounded-bl-md bg-muted p-4 text-sm leading-6">
                    Apa 2ta blue kurti lagbe. Bashundhara R/A, block D. COD 2400. Number
                    01712 345678
                  </div>
                  <div className="ml-auto w-fit rounded-2xl rounded-br-md bg-brand px-4 py-3 text-sm text-brand-foreground">
                    Got it—checking the order details.
                  </div>
                </div>
                <div className="rounded-2xl border bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-heading font-bold">Order draft</p>
                    <span className="text-xs font-semibold text-brand">96% confident</span>
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    {[
                      ["Customer", "Not provided"],
                      ["Phone", "01712 345678"],
                      ["Product", "Blue kurti × 2"],
                      ["Address", "Bashundhara R/A, Block D"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="text-right font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-muted px-3 py-2.5">
                    <span className="text-sm font-semibold text-brand">Courier ready</span>
                    <PackageCheck className="size-5 text-brand" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-card/65">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
          {capabilities.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-sm font-semibold">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              {label}
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">One simple workflow</p>
          <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            Keep selling. OrderShune handles the admin.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article key={number} className="relative rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="font-mono text-sm font-semibold text-muted-foreground">{number}</span>
              </div>
              <h3 className="mt-10 font-heading text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Local by design</p>
            <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
              The tools your Bangladesh business already needs.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-background/70">
              Work naturally in Bangla, Banglish, or English. Keep your familiar courier
              workflow while your team gets a cleaner view of every order and COD amount.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Pathao", "REDX", "Steadfast", "Delivery Tiger", "Courier labels", "COD tracking"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="flex size-8 items-center justify-center rounded-full bg-emerald-300 text-emerald-950">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <span className="font-semibold">{item}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border bg-brand-muted p-7 sm:p-12 lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Ready when you are</p>
            <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
              Make your next order the easy one.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Start with 50 free orders every month. Upgrade only when your business grows.
            </p>
          </div>
          <Button asChild size="lg" className="mt-8 shrink-0 lg:mt-0">
            <Link href="/signup">
              Start free <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
