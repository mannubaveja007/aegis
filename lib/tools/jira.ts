// Jira tools — Swytchcode Runtime SDK
// Auth: managed (oauth2) — credentials injected by the CLI

import { exec } from "@swytchcode/runtime";

export async function createTicket(input: unknown): Promise<unknown> {
  // jira.api.issue.create — POST /rest/api/3/issue
  // Required: body.fields (project, summary, issuetype, description, priority)
  const { summary, description, priority } = input as {
    summary: string;
    description: string;
    priority: string;
  };

  const result = await exec("jira.api.issue.create", {
    body: {
      fields: {
        project: { key: process.env.JIRA_PROJECT_KEY || "OPS" },
        summary,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: description }],
            },
          ],
        },
        issuetype: { name: "Task" },
        priority: { name: priority },
      },
    },
  });

  return result;
}
