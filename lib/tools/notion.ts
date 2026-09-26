// Notion tools — Swytchcode Runtime SDK
// Auth: managed (oauth2) — credentials injected by the CLI
// Adds rows to the "Orders Ledger" database in the Company ledger page

import { exec } from "@swytchcode/runtime";

export async function createLogEntry(input: unknown): Promise<unknown> {
  // notion.page.create — POST /v1/pages
  // Creates a new row in the Orders Ledger database
  const { case_id, risk_tier, action, policy_result, injection_flagged } =
    input as {
      case_id: string;
      risk_tier: string;
      action: string;
      policy_result: string;
      injection_flagged: boolean;
    };

  const dbId = process.env.NOTION_AUDIT_DB_ID;
  if (!dbId) {
    throw new Error(
      "NOTION_AUDIT_DB_ID is not set. Set it to the Orders Ledger database ID."
    );
  }

  // Map policy_result to Order Status values in the database
  const statusMap: Record<string, string> = {
    approve: "Confirmed",
    block: "Cancelled",
    blocked: "Cancelled",
    review: "Processing",
  };

  // Map policy_result to Payment Status
  const paymentStatusMap: Record<string, string> = {
    approve: "Refunded",
    block: "Failed",
    blocked: "Failed",
    review: "Pending",
  };

  const result = await exec("notion.page.create", {
    body: {
      parent: { database_id: dbId },
      properties: {
        Order: {
          title: [{ text: { content: `Case #${case_id}` } }],
        },
        "Order Status": {
          status: { name: statusMap[policy_result] || "Processing" },
        },
        "Payment Status": {
          select: {
            name: paymentStatusMap[policy_result] || "Pending",
          },
        },
        Notes: {
          rich_text: [
            {
              text: {
                content: `[${risk_tier.toUpperCase()}] ${action}${injection_flagged ? " 🚨 INJECTION DETECTED" : ""}`,
              },
            },
          ],
        },
        "Priority Order": {
          checkbox: risk_tier === "high" || injection_flagged,
        },
      },
    },
  });

  return result;
}
