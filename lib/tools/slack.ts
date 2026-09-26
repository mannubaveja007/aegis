// Slack tools — Swytchcode Runtime SDK
// Auth: managed (oauth2) — credentials injected by the CLI

import { exec } from "@swytchcode/runtime";

// Default ops channel — #aegis-ops
const OPS_CHANNEL = process.env.SLACK_OPS_CHANNEL || "C0C5H1FQZJL";

export async function postMessage(input: unknown): Promise<unknown> {
  const { channel, text } = input as {
    channel: string;
    text: string;
  };

  // Resolve channel: if it looks like a name, use the env var fallback
  const channelId = channel.startsWith("C") ? channel : OPS_CHANNEL;

  // Returns: { data: { ok: boolean, channel: string, ts: string, message: {...} } }
  const result = await exec("slack.chat.postmessage.create", {
    body: {
      channel: channelId,
      text,
      mrkdwn: "true",
    },
  });

  return result;
}
