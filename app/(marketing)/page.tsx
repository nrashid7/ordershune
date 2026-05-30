import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="text-xl font-bold text-emerald-700">OrderShune</div>
        <div className="flex gap-2">
          <Button asChild variant="ghost">
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Start free</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="py-12 text-center sm:py-20">
          <p className="text-sm font-medium text-emerald-700">WhatsApp-first order assistant</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Turn customer messages into courier-ready orders
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            For Bangladeshi Facebook, WhatsApp, and Instagram sellers. Extract orders from
            chats, screenshots, and voice notes, then prepare courier bookings in seconds.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-8 text-base">
            <Link href="/signup">Start free</Link>
          </Button>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "1. Message",
              body: "Forward customer text, screenshot, or voice note from WhatsApp or social chat.",
            },
            {
              title: "2. Order",
              body: "OrderShune extracts customer details, product info, COD amount, and missing fields.",
            },
            {
              title: "3. Courier",
              body: "Generate courier-ready parcel format for Pathao, REDX, Steadfast, and more.",
            },
          ].map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{step.body}</CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Supported inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>• Paste customer text (Bangla, Banglish, English)</p>
              <p>• Upload order screenshots</p>
              <p>• Upload voice notes for transcription</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Supported courier formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>• Pathao</p>
              <p>• REDX</p>
              <p>• Steadfast</p>
              <p>• Delivery Tiger</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center">FAQ</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              {
                q: "How do I connect WhatsApp?",
                a: "Sign up, complete onboarding with your seller phone, then point Meta webhook to /api/whatsapp/webhook.",
              },
              {
                q: "Which couriers are supported?",
                a: "Pathao, REDX, Steadfast, and Delivery Tiger — with live APIs when you add credentials.",
              },
              {
                q: "Can my team help?",
                a: "Pro plan supports team invites from Settings → Team.",
              },
              {
                q: "Is there a free plan?",
                a: "Yes — 50 orders per month on the free tier. See Pricing for details.",
              },
            ].map((item) => (
              <Card key={item.q}>
                <CardHeader>
                  <CardTitle className="text-base">{item.q}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{item.a}</CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Questions?{" "}
            <a href="mailto:support@ordershune.com" className="text-emerald-700 underline">
              support@ordershune.com
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
