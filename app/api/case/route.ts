import { NextRequest } from "next/server";
import type { CaseRequest, AgentStep } from "@/types/aegis";
import { sanitize } from "@/lib/sanitizer";
import { runReasoner } from "@/lib/reasoner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { message } = (await req.json()) as CaseRequest;

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Run pipeline in background — writes flush to client immediately
  (async () => {
    function emit(step: AgentStep) {
      writer.write(encoder.encode(JSON.stringify(step) + "\n"));
    }

    try {
      emit({ type: "reasoning", text: "Sanitizing input..." });
      const sanitized = await sanitize(message);
      emit({
        type: "reasoning",
        text: `Extracted: order ${sanitized.order_id ?? "unknown"}, sentiment ${sanitized.sentiment}, action "${sanitized.requested_action}"`,
      });

      if (sanitized.injection_detected && sanitized.injection_span) {
        emit({ type: "injection_flag", span: sanitized.injection_span });
      }

      await runReasoner(sanitized, emit);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      emit({ type: "final", summary: `Error: ${msg}` });
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
