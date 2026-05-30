"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createOrganization, inviteTeamMember } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TeamClient({
  organization,
  invites,
}: {
  organization: { id: string; name: string } | null;
  invites: Array<{ email: string; role: string }>;
}) {
  const [orgName, setOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-4">
      {!organization ? (
        <Card>
          <CardHeader>
            <CardTitle>Create team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Organization name</Label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <Button
              disabled={pending || !orgName}
              onClick={async () => {
                setPending(true);
                const r = await createOrganization(orgName);
                setPending(false);
                if (r.error) toast.error(r.error);
                else toast.success("Team created");
              }}
            >
              Create
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{organization.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">You are the owner</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Invite member</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button
                disabled={pending || !inviteEmail}
                onClick={async () => {
                  setPending(true);
                  const r = await inviteTeamMember(inviteEmail, organization.id);
                  setPending(false);
                  if (r.error) toast.error(r.error);
                  else toast.success(r.message);
                }}
              >
                Invite
              </Button>
            </CardContent>
          </Card>
          {invites.length > 0 ? (
            <ul className="text-sm text-muted-foreground">
              {invites.map((i) => (
                <li key={i.email}>
                  {i.email} ({i.role})
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}
