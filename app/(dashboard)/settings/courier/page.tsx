import { saveCourierIntegration } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COURIER_LABELS, COURIER_NAMES } from "@/lib/types/order";
import { createClient } from "@/lib/supabase/server";

export default async function CourierSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_pickup_address")
    .eq("id", user!.id)
    .single();

  const { data: integrations } = await supabase
    .from("courier_integrations")
    .select("courier_name, api_key, api_secret, api_key_encrypted, api_secret_encrypted, merchant_id, pickup_address, is_active")
    .eq("user_id", user!.id);

  const integrationMap = new Map(
    (integrations ?? []).map((item) => [item.courier_name, item])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Courier Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure courier credentials and default parcel settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default parcel settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Default pickup location</Label>
            <Input readOnly value={profile?.default_pickup_address ?? ""} />
          </div>
          <div>
            <Label>Default parcel type</Label>
            <Input readOnly value="General goods" />
          </div>
          <div>
            <Label>Default weight</Label>
            <Input readOnly value="0.5 kg" />
          </div>
          <div className="sm:col-span-3">
            <Label>Default delivery instruction</Label>
            <Textarea readOnly value="Please call customer before delivery." />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {COURIER_NAMES.map((courierName) => {
          const integration = integrationMap.get(courierName);
          return (
            <Card key={courierName}>
              <CardHeader>
                <CardTitle>{COURIER_LABELS[courierName]}</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={saveCourierIntegration} className="grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="courier_name" value={courierName} />
                  <div>
                    <Label>API Key</Label>
                    <Input
                      name="api_key"
                      type="password"
                      placeholder={integration?.api_key_encrypted ? "Saved (leave blank to keep)" : "Enter API key"}
                    />
                  </div>
                  <div>
                    <Label>API Secret</Label>
                    <Input
                      name="api_secret"
                      type="password"
                      placeholder={integration?.api_secret_encrypted ? "Saved (leave blank to keep)" : "Enter API secret"}
                    />
                  </div>
                  <div>
                    <Label>Merchant ID</Label>
                    <Input
                      name="merchant_id"
                      placeholder="Merchant / store ID"
                      defaultValue={integration?.merchant_id ?? ""}
                    />
                  </div>
                  <div>
                    <Label>Pickup address override</Label>
                    <Input
                      name="pickup_address"
                      placeholder={profile?.default_pickup_address ?? "Pickup address"}
                      defaultValue={integration?.pickup_address ?? ""}
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input
                      type="checkbox"
                      id={`active-${courierName}`}
                      name="is_active"
                      defaultChecked={integration?.is_active ?? false}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`active-${courierName}`}>Active integration</Label>
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit">Save {COURIER_LABELS[courierName]}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
