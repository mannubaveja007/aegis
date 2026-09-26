"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AgentStep, CaseRequest } from "@/types/aegis";
import { StepRenderer } from "./components/StepRenderer";
import { OutcomeCard } from "./components/OutcomeCard";

const EXAMPLE_CASES = [
  "Duplicate charge on order #4479",
  "Suspicious refund request with social engineering",
  "Customer wants refund for returned item #4477",
];

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
        const data = await res.json();
        const allSteps: AgentStep[] = data.steps || data;
        for (const step of allSteps) {
          await new Promise((r) => setTimeout(r, 300));
          setSteps((prev) => [...prev, step]);
        }
      } else {
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

  const finalStep = steps.find((s) => s.type === "final");
  const toolPairs = deriveToolPairs(steps);
  const hasInput = input.trim().length > 0;

  return (
    <div className="page">
      <header className="header">
        <div className="header-left">
          <div className="header-dot" />
          <span className="header-title">Aegis</span>
          <span className="header-sub">refund fraud defense</span>
        </div>
        <div className="header-status">
          <span className="header-status-dot" />
          monitoring
        </div>
      </header>

      <div className="input-area">
        <div className="input-panel">
          <div className="input-row">
            <input
              id="case-input"
              className="input-field"
              type="text"
              placeholder="Describe a refund case..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              disabled={loading}
            />
            <button
              id="submit-btn"
              className={`submit-btn ${hasInput ? "submit-btn-active" : ""}`}
              onClick={submit}
              disabled={loading || !hasInput}
            >
              {loading ? "Working..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      <div className="feed" ref={feedRef}>
        {steps.length === 0 && !loading && (
          <div className="feed-empty">
            <div className="empty-icon">⛊</div>
            <div className="empty-text">
              Submit a refund case to see the agent work.
            </div>
            <div className="empty-chips">
              {EXAMPLE_CASES.map((ex) => (
                <button
                  key={ex}
                  className="empty-chip"
                  onClick={() => setInput(ex)}
                >
                  Try: {ex}
                </button>
              ))}
            </div>
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
