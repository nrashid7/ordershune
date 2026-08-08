"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHANNEL_LABELS: Record<string, string> = {
  messenger: "Messenger",
  instagram: "Instagram",
};

export function InboxList({
  conversations,
}: {
  conversations: Array<{
    id: string;
    channel: string;
    sender_id: string;
    sender_name: string | null;
    last_message: string | null;
    last_order_id: string | null;
    state: string;
    updated_at: string;
  }>;
}) {
  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No captured conversations yet. Connect Messenger or Instagram in Settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <Card key={conv.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">
                {conv.sender_name ?? conv.sender_id}
              </CardTitle>
              <Badge variant="outline">{CHANNEL_LABELS[conv.channel] ?? conv.channel}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {conv.last_message ?? "—"}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(conv.updated_at).toLocaleString()}</span>
              <span className="capitalize">{conv.state}</span>
            </div>
            {conv.last_order_id ? (
              <Link
                href={`/orders/${conv.last_order_id}`}
                className="text-sm font-medium text-brand hover:underline"
              >
                View linked order
              </Link>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
