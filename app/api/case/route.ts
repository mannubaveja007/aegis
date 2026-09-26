import { NextRequest } from "next/server";
import type { CaseRequest, AgentStep } from "@/types/aegis";
import { sanitize } from "@/lib/sanitizer";
import { runReasoner } from "@/lib/reasoner";

export async function POST(req: NextRequest) {
  const { message } = (await req.json()) as CaseRequest;

  // NDJSON stream — each AgentStep is a JSON line
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function emit(step: AgentStep) {
        controller.enqueue(encoder.encode(JSON.stringify(step) + "\n"));
      }

      try {
        // Step 1: Sanitize
        emit({ type: "reasoning", text: "Sanitizing input..." });
        const sanitized = await sanitize(message);
        emit({
          type: "reasoning",
          text: `Extracted: order ${sanitized.order_id ?? "unknown"}, sentiment ${sanitized.sentiment}, action "${sanitized.requested_action}"`,
        });

        // Step 2: Run reasoner with live step callbacks
        await runReasoner(sanitized, emit);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown error";
        emit({ type: "final", summary: `Error: ${msg}` });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
