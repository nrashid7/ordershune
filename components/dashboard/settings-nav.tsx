"use client";

import { SettingsNavLink, type NavItem } from "@/components/dashboard/nav-link";

const links: NavItem[] = [
  { href: "/settings/profile", label: "Profile", match: "exact" },
  { href: "/settings/courier", label: "Courier", match: "exact" },
  { href: "/settings/courier/compare", label: "Compare rates", match: "exact" },
  { href: "/settings/channels", label: "Channels", match: "exact" },
  { href: "/settings/team", label: "Team", match: "exact" },
  { href: "/settings/billing", label: "Billing", match: "exact" },
];

export function SettingsNav() {
  return (
    <nav aria-label="Settings navigation" className="flex flex-wrap gap-2">
      {links.map((link) => (
        <SettingsNavLink key={link.href} item={link} />
      ))}
    </nav>
  );
}
