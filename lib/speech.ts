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

export async function transcribeAudio(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const provider = process.env.SPEECH_PROVIDER ?? "mock";

  switch (provider) {
    case "openai":
      return transcribeWithOpenAI(buffer, mimeType);
    case "google":
      throw new Error("Google Speech-to-Text not implemented yet");
    case "mock":
    default:
      return MOCK_TRANSCRIPT;
  }
}
