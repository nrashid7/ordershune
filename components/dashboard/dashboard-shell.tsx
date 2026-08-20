"use client";

import Link from "next/link";
import { AudioLines, ChevronRight, LogOut, Menu, Plus } from "lucide-react";
import { DashboardNavLink } from "@/components/dashboard/nav-link";
import {
  desktopNavItems,
  mobileNavItems,
  secondaryNavItems,
} from "@/components/dashboard/navigation";
import { signOut } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground md:flex">
        <Link
          href="/dashboard"
          className="flex min-h-11 items-center gap-2.5 rounded-xl px-2 font-heading text-xl font-extrabold tracking-[-0.035em] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/40"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <AudioLines className="size-5" aria-hidden="true" />
          </span>
          OrderShune
        </Link>

        <div className="mt-7">
          <Button asChild className="w-full justify-start bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
            <Link href="/orders/new">
              <Plus aria-hidden="true" />
              Create order
            </Link>
          </Button>
        </div>

        <nav aria-label="Main navigation" className="mt-7 flex flex-1 flex-col gap-1">
          <p className="mb-2 px-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">
            Workspace
          </p>
          {desktopNavItems.map((item) => (
            <DashboardNavLink key={item.href} item={item} sidebar />
          ))}
        </nav>

        <div className="rounded-2xl border border-sidebar-border bg-white/5 p-3">
          <p className="text-xs font-semibold text-sidebar-foreground/55">Need a hand?</p>
          <a
            href="mailto:support@ordershune.com"
            className="mt-1 flex min-h-10 items-center justify-between text-sm font-semibold hover:text-sidebar-primary"
          >
            Contact support
            <ChevronRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <form action={signOut} className="mt-2">
          <Button
            variant="ghost"
            type="submit"
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut aria-hidden="true" />
            Log out
          </Button>
        </form>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/92 px-4 backdrop-blur-md md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 font-heading text-lg font-extrabold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background">
              <AudioLines className="size-5" aria-hidden="true" />
            </span>
            OrderShune
          </Link>
          <Button asChild size="icon" aria-label="Create order">
            <Link href="/orders/new">
              <Plus aria-hidden="true" />
            </Link>
          </Button>
        </header>

        {children}

        <nav
          aria-label="Mobile navigation"
          className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/96 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(18,48,35,0.08)] backdrop-blur-md md:hidden"
        >
          <div className="grid grid-cols-5 gap-1">
            {mobileNavItems.slice(0, 4).map((item) => (
              <DashboardNavLink key={item.href} item={item} mobile />
            ))}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="flex h-auto min-h-12 flex-col gap-1 py-1.5 text-[0.68rem]">
                  <Menu className="size-5" aria-hidden="true" />
                  More
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl pb-[env(safe-area-inset-bottom)]">
                <SheetHeader className="border-b px-5 py-5">
                  <SheetTitle className="text-xl font-bold">More tools</SheetTitle>
                  <SheetDescription>COD, alerts, settings, and account actions.</SheetDescription>
                </SheetHeader>
                <nav aria-label="More navigation" className="grid gap-2 p-4">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className="flex min-h-12 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                        >
                          {Icon ? <Icon className="size-5 text-brand" aria-hidden="true" /> : null}
                          {item.label}
                          <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>
                <form action={signOut} className="border-t p-4">
                  <Button variant="outline" type="submit" className="w-full justify-start">
                    <LogOut aria-hidden="true" />
                    Log out
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </div>
  );
}
