"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { createOrganization, inviteTeamMember, revokeInvite } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TeamClient({
  organization,
  invites,
}: {
  organization: { id: string; name: string } | null;
  invites: Array<{ id: string; email: string; role: string; token: string; status: string }>;
}) {
  const [orgName, setOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

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
            <CardContent className="space-y-3">
              <div className="flex gap-2">
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
                    else {
                      toast.success(r.message);
                      if (r.inviteUrl) setLastInviteUrl(r.inviteUrl);
                    }
                  }}
                >
                  Invite
                </Button>
              </div>
              {lastInviteUrl ? (
                <div className="flex items-center gap-2">
                  <Input readOnly value={lastInviteUrl} className="text-xs" />
                  <CopyButton text={lastInviteUrl} label="Copy link" />
                </div>
              ) : null}
            </CardContent>
          </Card>
          {invites.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Pending invites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {invites.map((i) => {
                    const inviteUrl = `${window.location.origin}/invite/${i.token}`;
                    return (
                      <li
                        key={i.id}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span>
                          {i.email} ({i.role}) — {i.status}
                        </span>
                        <div className="flex gap-2">
                          <CopyButton text={inviteUrl} label="Copy link" />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={async () => {
                              setPending(true);
                              const r = await revokeInvite(i.id);
                              setPending(false);
                              if (r.error) toast.error(r.error);
                              else toast.success("Invite revoked");
                            }}
                          >
                            Revoke
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
