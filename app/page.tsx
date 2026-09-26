"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AgentStep, CaseRequest } from "@/types/aegis";
import { StepRenderer } from "./components/StepRenderer";
import { OutcomeCard } from "./components/OutcomeCard";
import "./globals.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [loading, setLoading] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [steps]);

  const submit = useCallback(async () => {
    const message = input.trim();
    if (!message || loading) return;

    setInput("");
    setSteps([]);
    setLoading(true);

    try {
      const res = await fetch("/api/case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message } satisfies CaseRequest),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        // Current stub: full JSON array
        const data = await res.json();
        const allSteps: AgentStep[] = data.steps || data;

        // Stagger steps for demo feel
        for (const step of allSteps) {
          await new Promise((r) => setTimeout(r, 300));
          setSteps((prev) => [...prev, step]);
        }
      } else {
        // Future: newline-delimited JSON stream
        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const step = JSON.parse(trimmed) as AgentStep;
              setSteps((prev) => [...prev, step]);
            } catch {
              // skip malformed lines
            }
          }
        }

        // flush remaining buffer
        if (buffer.trim()) {
          try {
            const step = JSON.parse(buffer.trim()) as AgentStep;
            setSteps((prev) => [...prev, step]);
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      console.error("Case submission failed:", err);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  // Derive outcome
  const finalStep = steps.find((s) => s.type === "final");
  const toolPairs = deriveToolPairs(steps);

  return (
    <div className="page">
      <header className="header">
        <span className="header-title">Aegis</span>
        <span className="header-sub">refund fraud defense</span>
      </header>

      <div className="input-area">
        <div className="input-row">
          <input
            className="input-field"
            type="text"
            placeholder="Describe a refund case..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            disabled={loading}
          />
          <button
            className="submit-btn"
            onClick={submit}
            disabled={loading || !input.trim()}
          >
            {loading ? "Working..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="feed" ref={feedRef}>
        {steps.length === 0 && !loading && (
          <div className="feed-empty">
            Submit a refund case to see the agent work.
          </div>
        )}

        {steps
          .filter((s) => s.type !== "final")
          .map((step, i) => (
            <StepRenderer key={i} step={step} />
          ))}

        {loading && (
          <div className="loading">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        )}
      </div>

      {finalStep && finalStep.type === "final" && (
        <OutcomeCard summary={finalStep.summary} toolCalls={toolPairs} />
      )}
    </div>
  );
}

/** Pair tool_call steps with their subsequent tool_result */
function deriveToolPairs(steps: AgentStep[]) {
  const pairs: Array<{ tool: string; input: unknown; output: unknown }> = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s.type === "tool_call") {
      const next = steps[i + 1];
      pairs.push({
        tool: s.tool,
        input: s.input,
        output: next?.type === "tool_result" ? next.output : null,
      });
    }
  }
  return pairs;
}
