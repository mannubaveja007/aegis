// Notion tools — Swytchcode Runtime SDK
// Auth: managed (oauth2) — credentials injected by the CLI

import { exec } from "@swytchcode/runtime";

export async function createLogEntry(input: unknown): Promise<unknown> {
  // notion.page.create — POST /v1/pages
  // Creates a page in a database (the audit log)
  const { case_id, risk_tier, action, policy_result, injection_flagged } =
    input as {
      case_id: string;
      risk_tier: string;
      action: string;
      policy_result: string;
      injection_flagged: boolean;
    };

  const result = await exec("notion.page.create", {
    body: {
      parent: {
        database_id: process.env.NOTION_AUDIT_DB_ID || "aegis-audit-log",
      },
      properties: {
        "Case ID": { title: [{ text: { content: case_id } }] },
        "Risk Tier": { select: { name: risk_tier } },
        "Action Taken": { rich_text: [{ text: { content: action } }] },
        "Policy Result": { select: { name: policy_result } },
        "Injection Flagged": { checkbox: injection_flagged },
        Timestamp: { date: { start: new Date().toISOString() } },
      },
    },
  });

  return result;
}
