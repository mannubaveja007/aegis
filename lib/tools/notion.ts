// Notion tools — Swytchcode Runtime SDK
// Auth: managed (oauth2) — credentials injected by the CLI
// Appends audit log entries as blocks to an existing Notion page

import { exec } from "@swytchcode/runtime";

export async function createLogEntry(input: unknown): Promise<unknown> {
  // notion.children.update — PATCH /v1/blocks/{block_id}/children
  // Appends paragraph blocks to the page the user already shared with Notion+Swytchcode
  const { case_id, risk_tier, action, policy_result, injection_flagged } =
    input as {
      case_id: string;
      risk_tier: string;
      action: string;
      policy_result: string;
      injection_flagged: boolean;
    };

  const pageId = process.env.NOTION_AUDIT_PAGE_ID;
  if (!pageId) {
    throw new Error(
      "NOTION_AUDIT_PAGE_ID is not set. Set it to the ID of the Notion page shared with the integration."
    );
  }

  const timestamp = new Date().toISOString();
  const injectionTag = injection_flagged ? " 🚨 INJECTION FLAGGED" : "";

  const logLine = `[${timestamp}] Case: ${case_id} | Risk: ${risk_tier} | Action: ${action} | Policy: ${policy_result}${injectionTag}`;

  const result = await exec("notion.children.update", {
    block_id: pageId,
    body: {
      children: [
        {
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: logLine },
              },
            ],
          },
        },
      ],
    },
  });

  return result;
}
