"use client";

import { useState } from "react";
import type { AgentStep } from "@/types/aegis";

interface StepRendererProps {
  step: AgentStep;
}

export function StepRenderer({ step }: StepRendererProps) {
  switch (step.type) {
    case "reasoning":
      return <div className="step step-reasoning">{step.text}</div>;
    case "tool_call":
      return <ToolCard tag="call" tool={step.tool} data={step.input} />;
    case "tool_result":
      return <ToolCard tag="result" tool={step.tool} data={step.output} />;
    case "jev_gate":
      return (
        <div className={`step step-jev step-jev-${step.outcome}`}>
          <div className="jev-label">
            Jev gate: {step.outcome}
          </div>
          <div className="jev-reason">{step.reason}</div>
        </div>
      );
    case "injection_flag":
      return (
        <div className="step step-injection">
          <div className="injection-label">Injection detected</div>
          <code className="injection-span">{step.span}</code>
        </div>
      );
    case "final":
      return null; // handled by OutcomeCard
    default:
      return null;
  }
}

function ToolCard({
  tag,
  tool,
  data,
}: {
  tag: "call" | "result";
  tool: string;
  data: unknown;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="step step-tool">
      <div className="tool-header" onClick={() => setOpen(!open)}>
        <span className={`tool-tag tool-tag-${tag}`}>{tag}</span>
        <span className="tool-name">{tool}</span>
        <span className={`tool-chevron ${open ? "tool-chevron-open" : ""}`}>
          ▸
        </span>
      </div>
      {open && (
        <div className="tool-body">{JSON.stringify(data, null, 2)}</div>
      )}
    </div>
  );
}
