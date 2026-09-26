// Stripe tools — Swytchcode Runtime SDK
// Auth: managed (api_key) — credentials injected by the CLI, never set manually

import { exec } from "@swytchcode/runtime";

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
  // stripe.refund.create3 — POST /v1/charges/{charge}/refund
  // Required: charge (path)
  // Optional: amount (body, int, cents)
  const { chargeId, amount, reason } = input as {
    chargeId: string;
    amount: number;
    reason?: string;
  };

  const body: Record<string, unknown> = {};
  if (amount != null) body.amount = amount;
  // reason is metadata — pass as metadata if present
  if (reason) body.metadata = { reason };

  const result = await exec("stripe.refund.create3", {
    charge: chargeId,
    ...body,
  });

  return result;
}
