import { saveChannelIntegration } from "@/lib/actions/channels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

export default async function ChannelsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: integrations } = await supabase
    .from("channel_integrations")
    .select("*")
    .eq("user_id", user!.id);

  const map = new Map((integrations ?? []).map((i) => [i.channel, i]));

  const channels = [
    {
      id: "messenger",
      title: "Facebook Messenger",
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/messenger/webhook`,
    },
    {
      id: "instagram",
      title: "Instagram DM",
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/webhook`,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Channel integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect Messenger and Instagram to extract orders from DMs
        </p>
      </div>
      {channels.map((ch) => {
        const integration = map.get(ch.id);
        return (
          <Card key={ch.id}>
            <CardHeader>
              <CardTitle>{ch.title}</CardTitle>
              <p className="text-xs text-muted-foreground break-all">Webhook: {ch.webhook}</p>
            </CardHeader>
            <CardContent>
              <form action={saveChannelIntegration} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="channel" value={ch.id} />
                <div>
                  <Label>Page / Account ID</Label>
                  <Input name="page_id" defaultValue={integration?.page_id ?? ""} />
                </div>
                <div>
                  <Label>Verify token</Label>
                  <Input name="verify_token" defaultValue={integration?.verify_token ?? ""} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Access token</Label>
                  <Input name="access_token" type="password" placeholder="Leave blank to keep" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={integration?.is_active}
                  />
                  Active
                </label>
                <Button type="submit">Save</Button>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
