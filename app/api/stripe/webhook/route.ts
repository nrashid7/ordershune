import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PLAN_LIMITS } from "@/lib/subscriptions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secret);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan ?? "starter";
    if (userId) {
      await admin
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          stripe_subscription_id: String(session.subscription ?? ""),
          orders_limit: PLAN_LIMITS[plan] ?? 500,
        })
        .eq("user_id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    await admin
      .from("subscriptions")
      .update({ plan: "free", status: "canceled", orders_limit: PLAN_LIMITS.free })
      .eq("stripe_customer_id", customerId);
  }

  return NextResponse.json({ received: true });
}
