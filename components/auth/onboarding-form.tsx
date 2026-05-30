"use client";

import { useActionState } from "react";
import { saveProfile, type ActionState } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveProfile,
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your shop</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tell us about your business so OrderShune can prepare courier-ready orders.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <div>
            <Label htmlFor="full_name">Seller name</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div>
            <Label htmlFor="shop_name">Shop name</Label>
            <Input id="shop_name" name="shop_name" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone number (WhatsApp)</Label>
            <Input id="phone" name="phone" placeholder="017XXXXXXXX" required />
          </div>
          <div>
            <Label htmlFor="default_pickup_address">Default pickup address</Label>
            <Textarea id="default_pickup_address" name="default_pickup_address" required />
          </div>
          <div>
            <Label htmlFor="preferred_courier">Preferred courier</Label>
            <select
              id="preferred_courier"
              name="preferred_courier"
              defaultValue="pathao"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="pathao">Pathao</option>
              <option value="redx">REDX</option>
              <option value="steadfast">Steadfast</option>
              <option value="delivery_tiger">Delivery Tiger</option>
            </select>
          </div>
          <div>
            <Label htmlFor="default_payment_method">Default payment method</Label>
            <select
              id="default_payment_method"
              name="default_payment_method"
              defaultValue="cod"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="cod">COD</option>
              <option value="prepaid">Prepaid</option>
            </select>
          </div>
          <div>
            <Label htmlFor="product_category">Product category</Label>
            <Input
              id="product_category"
              name="product_category"
              placeholder="Fashion, Beauty, Electronics..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Complete setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
