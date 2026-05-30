import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} OrderShune — Built for Bangladeshi f-commerce sellers</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/pricing" className="hover:text-emerald-700">
            Pricing
          </Link>
          <Link href="/privacy" className="hover:text-emerald-700">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-emerald-700">
            Terms
          </Link>
          <a href="mailto:support@ordershune.com" className="hover:text-emerald-700">
            support@ordershune.com
          </a>
        </div>
      </div>
    </footer>
  );
}
