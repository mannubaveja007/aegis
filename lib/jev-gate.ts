// Jev Gate — Policy check via Google Gemini structured output
// Pure decision function: does not call Stripe, does not execute the refund

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { JevGateResult } from "@/types/aegis";

const jevSchema = z.object({
  withinPolicy: z.number().min(0).max(1).describe("Probability (0-1) that this refund complies with stated policy"),
  matchesTicket: z.number().min(0).max(1).describe("Probability (0-1) that the refund amount matches what the order actually shows"),
  suspicious: z.number().min(0).max(1).describe("Probability (0-1) that this request looks like manipulation or social engineering"),
});

const SYSTEM_PROMPT = `You are Jev, a fraud-detection policy engine. You evaluate refund requests against three dimensions and return calibrated probabilities (0.0–1.0):

1. withinPolicy: Does this refund amount and reason comply with the stated policy?
2. matchesTicket: Does the refund amount match what the ticket/order actually shows?
3. suspicious: Does anything about this request look like manipulation or social engineering?

Be precise. A score of 0.5 means genuinely uncertain. Output only the three numbers.`;

export async function gateRefund(
  proposedRefund: { chargeId: string; amount: number; reason?: string },
  ticket: { orderId: string; orderStatus: string; complaint: string },
  policy: { maxAutoApprove: number; requireReturnConfirmation: boolean }
): Promise<JevGateResult> {
  const { object: data } = await generateObject({
    model: google("gemini-3.1-flash-lite"),
    schema: jevSchema,
    system: SYSTEM_PROMPT,
    prompt: JSON.stringify({ proposedRefund, ticket, policy }),
    temperature: 0,
  });

  const { withinPolicy, matchesTicket, suspicious } = data;
  const probabilities = { withinPolicy, matchesTicket, suspicious };

  // Block checks first (most restrictive)
  if (suspicious > 0.6) {
    return {
      outcome: "block",
      reason: `suspicious ${(suspicious * 100).toFixed(0)}% > 60% threshold`,
      probabilities,
    };
  }

  if (matchesTicket < 0.3) {
    return {
      outcome: "block",
      reason: `matchesTicket ${(matchesTicket * 100).toFixed(0)}% < 30% threshold`,
      probabilities,
    };
  }

  // Approve only if all three pass
  if (withinPolicy > 0.8 && matchesTicket > 0.8 && suspicious < 0.2) {
    return {
      outcome: "approve",
      reason: "all thresholds passed",
      probabilities,
    };
  }

  // Everything else goes to human review
  const reasons: string[] = [];
  if (withinPolicy <= 0.8)
    reasons.push(`withinPolicy ${(withinPolicy * 100).toFixed(0)}% ≤ 80%`);
  if (matchesTicket <= 0.8)
    reasons.push(`matchesTicket ${(matchesTicket * 100).toFixed(0)}% ≤ 80%`);
  if (suspicious >= 0.2)
    reasons.push(`suspicious ${(suspicious * 100).toFixed(0)}% ≥ 20%`);

  return {
    outcome: "review",
    reason: reasons.join(", "),
    probabilities,
  };
}
