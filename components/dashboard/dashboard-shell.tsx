"use client";

import Link from "next/link";
import {
  Banknote,
  Bell,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { DashboardNavLink, type NavItem } from "@/components/dashboard/nav-link";
import { signOut } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, match: "exact" },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/cod", label: "COD", icon: Banknote },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings/profile", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-lg font-bold text-brand">
            OrderShune
          </Link>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Logout
            </Button>
          </form>
        </div>
        <nav
          aria-label="Main navigation"
          className="mx-auto hidden max-w-6xl gap-2 px-4 pb-3 md:flex"
        >
          {navItems.map((item) => (
            <DashboardNavLink key={item.href} item={item} />
          ))}
        </nav>
      </header>

      {children}

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 border-t bg-background p-2 md:hidden"
      >
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
          {navItems.map((item) => (
            <DashboardNavLink key={item.href} item={item} mobile />
          ))}
        </div>
      </nav>
    </>
  );
}
