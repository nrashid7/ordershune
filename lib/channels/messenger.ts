import {
  handleCommentChanges,
  parseCommentChanges,
  type FeedChange,
} from "@/lib/channels/comments";
import { resolveChannelCredentials } from "@/lib/channels/credentials";
import { handleMetaDmWebhook, parseMetaDmEntries } from "@/lib/channels/meta-dm";

export async function handleMessengerWebhook(body: unknown) {
  const payload = body as {
    object?: string;
    entry?: Array<{ id?: string; messaging?: unknown[]; changes?: unknown[] }>;
  };

  if (payload.object !== "page") return;

  const entries = parseMetaDmEntries(body);
  await handleMetaDmWebhook("messenger", entries);

  for (const entry of payload.entry ?? []) {
    const pageId = entry.id ?? "";
    const creds = await resolveChannelCredentials("messenger", pageId);
    if (!creds) continue;

    const changes = parseCommentChanges(
      entry as { id?: string; changes?: FeedChange[] }
    );
    if (changes.length > 0) {
      await handleCommentChanges("messenger", pageId, creds, changes);
    }
  }
}
