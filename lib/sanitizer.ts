import type { SanitizedCase } from "@/types/aegis";

// TODO: Gemini call — extract facts, flag injections, temperature 0, JSON output
export async function sanitize(rawText: string): Promise<SanitizedCase> {
  throw new Error("sanitize() not implemented yet");
}
