import {
  Banknote,
  Bell,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Users,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/nav-link";

export const desktopNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, match: "exact" },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/cod", label: "COD", icon: Banknote },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings/profile", label: "Settings", icon: Settings },
];

export const secondaryNavItems: NavItem[] = desktopNavItems.slice(4);

export const mobileNavItems: NavItem[] = [
  ...desktopNavItems.slice(0, 4),
  { href: "#more", label: "More", icon: Menu, match: "exact" },
];
