// Gmail tools — Swytchcode Runtime SDK
// Auth: managed (oauth2) — credentials injected by the CLI

import { exec } from "@swytchcode/runtime";

export async function sendDraft(input: unknown): Promise<unknown> {
  // gmail.user.drafts.create — POST /gmail/v1/users/{userId}/drafts
  // Required: userId (path, default "me")
  // Body: message.raw (base64url-encoded RFC 2822 email)
  const { to, subject, body } = input as {
    to: string;
    subject: string;
    body: string;
  };

  // Build RFC 2822 email and base64url-encode it
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    "",
    body,
  ].join("\r\n");

  const raw = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await exec("gmail.user.drafts.create", {
    userId: "me",
    body: {
      message: { raw },
    },
  });

  return result;
}
