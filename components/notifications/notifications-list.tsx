"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  order_id: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsList({ items }: { items: NotificationItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No alerts yet"
        description="Order updates and delivery notifications will appear here."
        actionHref="/orders"
        actionLabel="View orders"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => markAllNotificationsRead()}
      >
        Mark all read
      </Button>
      {items.map((n) => (
        <Card key={n.id} className={n.read_at ? "opacity-70" : ""}>
          <CardContent className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{n.title}</p>
              {n.body ? <p className="text-sm text-muted-foreground">{n.body}</p> : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleString()}
              </p>
              {n.order_id ? (
                <Link href={`/orders/${n.order_id}`} className="text-sm text-brand underline">
                  View order
                </Link>
              ) : null}
            </div>
            {!n.read_at ? (
              <Button size="sm" variant="ghost" onClick={() => markNotificationRead(n.id)}>
                Read
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
