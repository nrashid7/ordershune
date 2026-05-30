import { NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr";
import { transcribeAudio } from "@/lib/speech";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/webm",
  "audio/wav",
  "audio/x-wav",
]);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const kind = formData.get("kind");

    if (!(file instanceof File) || (kind !== "image" && kind !== "audio")) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File must be between 1 byte and 10 MB" },
        { status: 400 }
      );
    }

    const allowedTypes = kind === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text =
      kind === "image"
        ? await extractTextFromImage(buffer, file.type)
        : await transcribeAudio(buffer, file.type);

    const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("order_uploads")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logger.error("media-process upload failed", { error: uploadError.message });
      return NextResponse.json({ error: "Failed to store upload" }, { status: 500 });
    }

    return NextResponse.json({ text, storagePath: path });
  } catch (error) {
    logger.error("media-process failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Failed to process media" }, { status: 500 });
  }
}
