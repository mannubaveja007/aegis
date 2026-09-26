export type AgentStep =
  | { type: "reasoning"; text: string }
  | { type: "tool_call"; tool: string; input: unknown }
  | { type: "tool_result"; tool: string; output: unknown }
  | { type: "jev_gate"; outcome: "approve" | "block" | "review"; reason: string }
  | { type: "injection_flag"; span: string }
  | { type: "final"; summary: string };

export interface CaseRequest {
  message: string;
}

export interface SanitizedCase {
  order_id: string | null;
  complaint_summary: string;
  requested_action: string;
  sentiment: "neutral" | "frustrated" | "angry" | "urgent_pressure";
  injection_detected: boolean;
  injection_span: string | null;
}

export interface JevGateResult {
  outcome: "approve" | "block" | "review";
  reason: string;
  probabilities: {
    withinPolicy: number;
    matchesTicket: number;
    suspicious: number;
  };
}
