import Link from "next/link";
import { signOut } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Customers" },
  { href: "/cod", label: "COD" },
  { href: "/notifications", label: "Alerts" },
  { href: "/settings/profile", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-lg font-bold text-emerald-700">
            OrderShune
          </Link>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Logout
            </Button>
          </form>
        </div>
        <nav className="mx-auto hidden max-w-6xl gap-2 px-4 pb-3 md:flex">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t bg-background p-2 md:hidden">
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="flex-col h-auto py-2 text-xs">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}
