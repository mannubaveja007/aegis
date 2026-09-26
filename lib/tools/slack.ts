// Slack tools — Swytchcode Runtime SDK
// Auth: managed (oauth2) — credentials injected by the CLI

import { exec } from "@swytchcode/runtime";

export async function postMessage(input: unknown): Promise<unknown> {
  // slack.chat.postmessage.create — POST /chat.postMessage
  // Required: body.channel
  // Optional: body.text, body.blocks, body.mrkdwn, ...
  const { channel, text } = input as {
    channel: string;
    text: string;
  };

  const result = await exec("slack.chat.postmessage.create", {
    body: {
      channel,
      text,
      mrkdwn: true,
    },
  });

  return result;
}
