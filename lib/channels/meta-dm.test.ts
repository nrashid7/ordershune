import { describe, expect, it } from "vitest";
import { resolveCommentIds } from "@/lib/channels/comments";
import { parseMetaDmEntries } from "@/lib/channels/meta-dm";

describe("parseMetaDmEntries", () => {
  it("returns entry array from Meta webhook body", () => {
    const entries = parseMetaDmEntries({
      object: "page",
      entry: [{ id: "page-1", messaging: [] }],
    });
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe("page-1");
  });

  it("returns empty array when entry is missing", () => {
    expect(parseMetaDmEntries({})).toEqual([]);
    expect(parseMetaDmEntries({ object: "page" })).toEqual([]);
  });
});

describe("resolveCommentIds", () => {
  it("resolves Facebook feed comment IDs", () => {
    const ids = resolveCommentIds({
      comment_id: "fb-comment-1",
      post_id: "fb-post-1",
      from: { id: "user-1", name: "Apu" },
      message: "I want 2 pcs",
    });

    expect(ids).toEqual({
      commentId: "fb-comment-1",
      postId: "fb-post-1",
      senderId: "user-1",
      text: "I want 2 pcs",
    });
  });

  it("resolves Instagram comment IDs from id/media/text", () => {
    const ids = resolveCommentIds({
      id: "ig-comment-9",
      media: { id: "ig-media-3" },
      from: { id: "ig-user-2", username: "buyer" },
      text: "price?",
    });

    expect(ids).toEqual({
      commentId: "ig-comment-9",
      postId: "ig-media-3",
      senderId: "ig-user-2",
      text: "price?",
    });
  });
});
