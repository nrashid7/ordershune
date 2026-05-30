"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { type ActionState } from "@/lib/actions/auth";
import { updateProfile } from "@/lib/actions/profile";
import type { Profile } from "@/lib/types/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

export function ProfileSettingsForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateProfile,
    null
  );

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Seller name</Label>
            <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
          </div>
          <div>
            <Label htmlFor="shop_name">Shop name</Label>
            <Input id="shop_name" name="shop_name" defaultValue={profile?.shop_name ?? ""} required />
          </div>
          <div>
            <Label htmlFor="phone">WhatsApp phone</Label>
            <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} required />
          </div>
          <div>
            <Label htmlFor="default_pickup_address">Pickup address</Label>
            <Textarea
              id="default_pickup_address"
              name="default_pickup_address"
              defaultValue={profile?.default_pickup_address ?? ""}
              required
            />
          </div>
          <div>
            <Label htmlFor="preferred_courier">Preferred courier</Label>
            <select
              id="preferred_courier"
              name="preferred_courier"
              defaultValue={profile?.preferred_courier ?? "pathao"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="pathao">Pathao</option>
              <option value="redx">REDX</option>
              <option value="steadfast">Steadfast</option>
              <option value="delivery_tiger">Delivery Tiger</option>
            </select>
          </div>
          <div>
            <Label htmlFor="product_category">Product category</Label>
            <Input
              id="product_category"
              name="product_category"
              defaultValue={profile?.product_category ?? ""}
            />
          </div>
          <input
            type="hidden"
            name="default_payment_method"
            value={profile?.default_payment_method ?? "cod"}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
