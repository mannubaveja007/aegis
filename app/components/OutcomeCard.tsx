"use client";

import { useState } from "react";
import type { AgentStep } from "@/types/aegis";

interface OutcomeCardProps {
  summary: string;
  toolCalls: Array<{ tool: string; input: unknown; output: unknown }>;
}

export function OutcomeCard({ summary, toolCalls }: OutcomeCardProps) {
  return (
    <div className="outcome">
      <div className="outcome-summary">{summary}</div>
      <div className="outcome-chips">
        {toolCalls.map((tc, i) => (
          <ChipExpander key={i} tool={tc.tool} input={tc.input} output={tc.output} />
        ))}
      </div>
    </div>
  );
}

function ChipExpander({
  tool,
  input,
  output,
}: {
  tool: string;
  input: unknown;
  output: unknown;
}) {
  const [open, setOpen] = useState(false);
  const label = tool.split(".").pop() || tool;

  return (
    <>
      <button className="outcome-chip" onClick={() => setOpen(!open)}>
        {label} {open ? "▾" : "▸"}
      </button>
      {open && (
        <div className="step step-tool" style={{ width: "100%" }}>
          <div className="tool-body">
            <strong>input:</strong>{"\n"}
            {JSON.stringify(input, null, 2)}
            {"\n\n"}
            <strong>output:</strong>{"\n"}
            {JSON.stringify(output, null, 2)}
          </div>
        </div>
      )}
    </>
  );
}
