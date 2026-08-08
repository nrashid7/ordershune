const MOCK_TRANSCRIPT =
  "Nusrat apu red saree chai, Zigatola theke delivery. Phone 01922334455. COD 2500 taka.";

async function transcribeWithOpenAI(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.SPEECH_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured for speech");

  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  const formData = new FormData();
  formData.append("file", blob, "audio.webm");
  formData.append("model", "whisper-1");
  formData.append("language", "bn");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Whisper transcription failed");
  }

  const data = await response.json();
  return String(data.text ?? "").trim();
}

async function transcribeWithGoogle(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.SPEECH_API_KEY ?? process.env.OCR_API_KEY;
  if (!apiKey) throw new Error("SPEECH_API_KEY not configured for Google STT");

  const response = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: {
          encoding: mimeType.includes("webm") ? "WEBM_OPUS" : "LINEAR16",
          sampleRateHertz: 48000,
          languageCode: "bn-BD",
          alternativeLanguageCodes: ["en-US"],
        },
        audio: { content: buffer.toString("base64") },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Google Speech-to-Text failed");
  }

  const data = await response.json();
  const transcript = data?.results?.[0]?.alternatives?.[0]?.transcript;
  if (!transcript) throw new Error("Google STT returned no transcript");
  return String(transcript).trim();
}

export async function transcribeAudio(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const { allowMockProviders } = await import("@/lib/env");
  const provider = process.env.SPEECH_PROVIDER ?? "mock";

  switch (provider) {
    case "openai":
      return transcribeWithOpenAI(buffer, mimeType);
    case "google":
      return transcribeWithGoogle(buffer, mimeType);
    case "mock":
    default:
      if (!allowMockProviders()) {
        throw new Error(
          "SPEECH_PROVIDER=mock is not allowed in production. Set SPEECH_PROVIDER to openai or google."
        );
      }
      return MOCK_TRANSCRIPT;
  }
}
