import type { JevGateResult } from "@/types/aegis";

// TODO: OpenRouter System One API call — checks proposed refund against ticket + policy
// Returns approve/block/review based on probability thresholds
export async function gateRefund(
  proposedRefund: unknown,
  ticket: unknown,
  policy: unknown
): Promise<JevGateResult> {
  throw new Error("gateRefund() not implemented yet");
}
