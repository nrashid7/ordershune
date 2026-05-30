import { CreateOrderClient } from "@/components/orders/create-order-client";
import { createClient } from "@/lib/supabase/server";

export default async function CreateOrderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_courier, default_pickup_address")
    .eq("id", user!.id)
    .single();

  return (
    <CreateOrderClient
      preferredCourier={profile?.preferred_courier ?? "pathao"}
      pickupAddress={profile?.default_pickup_address ?? null}
    />
  );
}
