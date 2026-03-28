type StepStatus = "pending" | "active" | "done" | "error";

interface PipelineStepProps {
  index: number;
  label: string;
  description: string;
  status: StepStatus;
  elapsed?: string;
  isLast: boolean;
}

export default function PipelineStep({
  index,
  label,
  description,
  status,
  elapsed,
  isLast,
}: PipelineStepProps) {
  return (
    <div className="flex items-start gap-3 md:flex-col md:items-center md:gap-2">
      {/* Step indicator + connector line */}
      <div className="flex flex-col items-center md:flex-row md:w-full">
        {/* Circle */}
        <div
          className={`
            flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all
            ${
              status === "done"
                ? "bg-emerald-500 text-white"
                : status === "active"
                  ? "animate-pulse-glow bg-amber-400 text-gray-900"
                  : status === "error"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-400"
            }
          `}
        >
          {status === "done" ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : status === "error" ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            index + 1
          )}
        </div>

        {/* Connector line (horizontal on md+, vertical on mobile) */}
        {!isLast && (
          <div
            className={`
              ml-[17px] h-6 w-0.5 md:ml-0 md:h-0.5 md:w-full
              ${status === "done" ? "bg-emerald-500/50" : "bg-gray-700"}
            `}
          />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 pb-4 md:pb-0 md:text-center">
        <div
          className={`text-sm font-semibold ${
            status === "active"
              ? "text-amber-400"
              : status === "done"
                ? "text-emerald-400"
                : "text-gray-400"
          }`}
        >
          {label}
        </div>
        <div className="text-xs text-gray-500">{description}</div>
        {elapsed && (
          <div className="mt-0.5 font-mono text-xs text-gray-500">{elapsed}</div>
        )}
      </div>
    </div>
  );
}
