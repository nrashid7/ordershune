import { NextResponse } from "next/server";
import { z } from "zod";
import { extractOrder } from "@/lib/ai/extract-order";
import { logger } from "@/lib/logger";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  inputType: z.enum(["text", "image_ocr_text", "audio_transcript"]),
  text: z.string().min(1).max(20_000),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`extract:${ip}`, 60, 60_000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const extracted = await extractOrder(parsed.data.text, parsed.data.inputType);

    return NextResponse.json(extracted);
  } catch (error) {
    logger.error("extract-order failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to extract order" },
      { status: 500 }
    );
  }
}
