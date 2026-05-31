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
}: {
  item: NavItem;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href, item.match ?? "prefix");
  const Icon = item.icon;

  return (
    <Button
      asChild
      variant={active ? "secondary" : "ghost"}
      className={cn(
        mobile && "flex h-auto min-h-11 flex-col py-2 text-xs",
        active && "font-medium"
      )}
    >
      <Link href={item.href} aria-current={active ? "page" : undefined} aria-label={item.label}>
        {Icon ? <Icon className="mb-0.5 size-5 shrink-0" aria-hidden="true" /> : null}
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
