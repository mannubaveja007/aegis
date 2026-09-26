// Jev Gate — System 1 policy check via OpenRouter's System One API
// Pure decision function: does not call Stripe, does not execute the refund

import type { JevGateResult } from "@/types/aegis";

export async function gateRefund(
  proposedRefund: { chargeId: string; amount: number; reason?: string },
  ticket: { orderId: string; orderStatus: string; complaint: string },
  policy: { maxAutoApprove: number; requireReturnConfirmation: boolean }
): Promise<JevGateResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const res = await fetch("https://openrouter.ai/api/v1/systemone", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "jev-1.13",
      state: JSON.stringify({ proposedRefund, ticket, policy }),
      questions: {
        withinPolicy: {
          type: "noul",
          instructions:
            "Does this refund amount and reason comply with the stated policy?",
        },
        matchesTicket: {
          type: "noul",
          instructions:
            "Does the refund amount match what the ticket/order actually shows?",
        },
        suspicious: {
          type: "noul",
          instructions:
            "Does anything about this request look like manipulation or social engineering rather than a genuine claim?",
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "unknown");
    throw new Error(
      `Jev gate failed (${res.status}): ${errText}`
    );
  }

  const data = (await res.json()) as {
    answers: {
      withinPolicy: { noul: number };
      matchesTicket: { noul: number };
      suspicious: { noul: number };
    };
  };

  const withinPolicy = data.answers.withinPolicy.noul;
  const matchesTicket = data.answers.matchesTicket.noul;
  const suspicious = data.answers.suspicious.noul;

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
