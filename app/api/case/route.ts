import { NextRequest, NextResponse } from "next/server";
import type { CaseRequest, AgentStep } from "@/types/aegis";

// TODO: Replace with real sanitizer → reasoner → jev gate pipeline
export async function POST(req: NextRequest) {
  const { message } = (await req.json()) as CaseRequest;

  // Hardcoded fake steps so the frontend has something to render immediately
  const steps: AgentStep[] = [
    {
      type: "reasoning",
      text: `Received case: "${message}". Extracting order ID and complaint details...`,
    },
    {
      type: "tool_call",
      tool: "billbee.getOrderStatus",
      input: { orderId: "ORD-4471" },
    },
    {
      type: "tool_result",
      tool: "billbee.getOrderStatus",
      output: { state: "returned" },
    },
    {
      type: "tool_call",
      tool: "stripe.getEvent",
      input: { chargeId: "ch_1ABC123" },
    },
    {
      type: "tool_result",
      tool: "stripe.getEvent",
      output: {
        amount: 4999,
        currency: "usd",
        risk_level: "normal",
        risk_score: 12,
      },
    },
    {
      type: "reasoning",
      text: "Order confirmed returned. Charge is $49.99, risk_level normal, risk_score 12. This is a low-risk, routine refund. Proceeding with auto-resolution.",
    },
    {
      type: "jev_gate",
      outcome: "approve",
      reason: "Refund within policy limits, matches ticket, no suspicious signals.",
    },
    {
      type: "tool_call",
      tool: "stripe.issueRefund",
      input: { chargeId: "ch_1ABC123", amount: 4999 },
    },
    {
      type: "tool_result",
      tool: "stripe.issueRefund",
      output: { id: "re_1XYZ789", status: "succeeded" },
    },
    {
      type: "final",
      summary:
        "Refund of $49.99 issued successfully. Jira ticket AEGIS-42 created, Gmail draft sent to customer, Slack notification posted to #ops, Notion audit log updated.",
    },
  ];

  return NextResponse.json({ steps });
}
