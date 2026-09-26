// Stripe tools — Swytchcode Runtime SDK
// Auth: managed (api_key) — credentials injected by the CLI, never set manually

import { exec } from "@swytchcode/runtime";
import { gateRefund } from "@/lib/jev-gate";

export async function getEvent(id: string): Promise<unknown> {
  // stripe.charge.get — GET /v1/charges/{charge}
  // Required: charge (path)
  // Returns: { amount, currency, status, refunded, paid, outcome, ... }
  const result = await exec("stripe.charge.get", {
    charge: id,
  });

  return result;
}

export async function issueRefund(input: unknown): Promise<unknown> {
  const { chargeId, amount, reason } = input as {
    chargeId: string;
    amount: number;
    reason?: string;
  };

  // Run the Jev gate BEFORE touching Stripe
  const gate = await gateRefund(
    { chargeId, amount, reason },
    {
      orderId: chargeId,
      orderStatus: "pending_refund",
      complaint: reason || "refund requested",
    },
    {
      maxAutoApprove: 10000, // $100.00 in cents
      requireReturnConfirmation: true,
    }
  );

  if (gate.outcome === "block") {
    return {
      status: "blocked",
      gate_outcome: gate.outcome,
      gate_reason: gate.reason,
      probabilities: gate.probabilities,
    };
  }

  if (gate.outcome === "review") {
    return {
      status: "awaiting_review",
      gate_outcome: gate.outcome,
      gate_reason: gate.reason,
      probabilities: gate.probabilities,
    };
  }

  // gate.outcome === "approve" — proceed with the real refund
  const body: Record<string, unknown> = {};
  if (amount != null) body.amount = amount;
  if (reason) body.metadata = { reason };

  const result = await exec("stripe.refund.create3", {
    charge: chargeId,
    ...body,
  });

  return {
    ...(result as object),
    gate_outcome: gate.outcome,
    gate_reason: gate.reason,
    probabilities: gate.probabilities,
  };
}
