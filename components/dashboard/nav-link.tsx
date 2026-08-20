"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  match?: "exact" | "prefix";
};

function isActive(pathname: string, href: string, match: NavItem["match"] = "prefix") {
  if (match === "exact") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNavLink({
  item,
  mobile = false,
  sidebar = false,
}: {
  item: NavItem;
  mobile?: boolean;
  sidebar?: boolean;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href, item.match ?? "prefix");
  const Icon = item.icon;

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "justify-start",
        mobile && "flex h-auto min-h-12 flex-col gap-1 px-1 py-1.5 text-[0.68rem]",
        sidebar && "w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && !sidebar && "bg-brand-muted font-bold text-brand hover:bg-brand-muted hover:text-brand",
        active && sidebar && "bg-sidebar-accent font-bold text-sidebar-accent-foreground"
      )}
    >
      <Link href={item.href} aria-current={active ? "page" : undefined} aria-label={item.label}>
        {Icon ? <Icon className="size-5 shrink-0" aria-hidden="true" /> : null}
        <span>{item.label}</span>
      </Link>
    </Button>
  );
}

export function SettingsNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href, item.match ?? "exact");

  return (
    <Button asChild variant={active ? "secondary" : "outline"} size="sm">
      <Link href={item.href} aria-current={active ? "page" : undefined}>
        {item.label}
      </Link>
    </Button>
  );
}
