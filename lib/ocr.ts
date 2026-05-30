const MOCK_OCR_TEXT = `Sadia apu
2 ta blue kurti size M
Mirpur 10, House 45 Road 7
01798765432
COD 1200 taka
Call before delivery`;

async function extractWithOcrSpace(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.OCR_API_KEY;
  if (!apiKey) throw new Error("OCR_API_KEY not configured");

  const base64 = buffer.toString("base64");
  const formData = new FormData();
  formData.append("base64Image", `data:${mimeType};base64,${base64}`);
  formData.append("language", "ben");
  formData.append("isOverlayRequired", "false");

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: { apikey: apiKey },
    body: formData,
  });

  const data = await response.json();
  const text = data?.ParsedResults?.[0]?.ParsedText;
  if (!text) throw new Error("OCR.Space returned no text");
  return String(text).trim();
}

export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const provider = process.env.OCR_PROVIDER ?? "mock";

  switch (provider) {
    case "ocrspace":
      return extractWithOcrSpace(buffer, mimeType);
    case "google":
      throw new Error("Google Vision OCR not implemented yet — use ocrspace");
    case "tesseract":
      throw new Error("Tesseract OCR not implemented yet — use ocrspace");
    case "mock":
    default:
      return MOCK_OCR_TEXT;
  }
}
