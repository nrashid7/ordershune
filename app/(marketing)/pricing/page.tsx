import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "৳0",
    limit: "50 orders / month",
    features: ["Web dashboard", "WhatsApp bot", "Mock courier booking", "CSV export"],
  },
  {
    name: "Starter",
    price: "৳999",
    limit: "500 orders / month",
    features: ["Real courier APIs", "OCR + voice", "COD tracking", "Email support"],
    highlight: true,
  },
  {
    name: "Pro",
    price: "৳2,499",
    limit: "5,000 orders / month",
    features: ["Team accounts", "Messenger + Instagram", "Priority support", "Bulk import"],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <h1 className="text-center text-4xl font-bold">Simple pricing for growing shops</h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        Start free. Upgrade when you need real courier booking and higher volume.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.highlight ? "border-brand shadow-lg" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-3xl font-bold">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.limit}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link href="/signup">Get started</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
