"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { acceptInvite } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InviteAcceptClient({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Join team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You have been invited to join a team on OrderShune. Accept the invite to access
            shared orders.
          </p>
          <Button
            className="w-full"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              const result = await acceptInvite(token);
              setPending(false);
              if (result.error) toast.error(result.error);
              else {
                toast.success("You have joined the team");
                router.push("/dashboard");
              }
            }}
          >
            Accept invite
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
