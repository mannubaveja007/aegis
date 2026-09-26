import type { SanitizedCase, AgentStep } from "@/types/aegis";

// TODO: Vercel AI SDK generateText with Gemini, tool definitions, streaming steps
export async function runReasoner(
  sanitized: SanitizedCase,
  onStep: (s: AgentStep) => void
): Promise<void> {
  throw new Error("runReasoner() not implemented yet");
}
