import Link from "next/link";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/courier", label: "Courier" },
  { href: "/settings/courier/compare", label: "Compare rates" },
  { href: "/settings/channels", label: "Channels" },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/billing", label: "Billing" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </nav>
      {children}
    </div>
  );
}
