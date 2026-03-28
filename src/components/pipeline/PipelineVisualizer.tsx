import { useState, useEffect } from "react";
import type { GamePhase } from "../../lib/types";
import { PIPELINE_STEPS } from "../../lib/constants";
import PipelineStep from "./PipelineStep";

interface PipelineVisualizerProps {
  currentPhase: GamePhase;
  timings: Record<string, number>;
}

const PHASE_ORDER: GamePhase[] = [
  "committing",
  "seed_locked",
  "depositing",
  "matching",
  "constructing",
  "proving",
  "submitting",
  "verifying",
  "settling",
];

function phaseIndex(phase: GamePhase): number {
  const idx = PHASE_ORDER.indexOf(phase);
  return idx === -1 ? -1 : idx;
}

export default function PipelineVisualizer({
  currentPhase,
  timings,
}: PipelineVisualizerProps) {
  const [now, setNow] = useState(Date.now());

  // Update timer for active step elapsed display
  useEffect(() => {
    if (currentPhase === "idle" || currentPhase === "complete" || currentPhase === "error") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [currentPhase]);

  const currentIdx = phaseIndex(currentPhase);
  const isComplete = currentPhase === "complete";
  const isError = currentPhase === "error";

  // Don't render if we haven't started
  if (currentPhase === "idle") return null;

  return (
    <div className="animate-fade-in rounded-2xl border border-white/8 bg-white/3 p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Proof Pipeline
      </h3>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        {PIPELINE_STEPS.map((step, i) => {
          const stepIdx = phaseIndex(step.phase);
          let status: "pending" | "active" | "done" | "error";

          if (isError && stepIdx === currentIdx) {
            status = "error";
          } else if (isComplete || stepIdx < currentIdx) {
            status = "done";
          } else if (stepIdx === currentIdx) {
            status = "active";
          } else {
            status = "pending";
          }

          // Compute elapsed time
          let elapsed: string | undefined;
          const startTime = timings[step.phase];
          if (startTime) {
            if (status === "done") {
              // Find next phase start time to compute duration
              const nextPhase = PIPELINE_STEPS[i + 1]?.phase;
              const endTime = nextPhase
                ? timings[nextPhase] ?? timings["complete"] ?? now
                : timings["complete"] ?? now;
              elapsed = formatDuration(endTime - startTime);
            } else if (status === "active") {
              elapsed = formatDuration(now - startTime);
            }
          }

          return (
            <PipelineStep
              key={step.phase}
              index={i}
              label={step.label}
              description={step.description}
              status={status}
              elapsed={elapsed}
              isLast={i === PIPELINE_STEPS.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}
