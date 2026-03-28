import { useEffect, useRef } from "react";

interface LogTerminalProps {
  logs: string[];
}

export default function LogTerminal({ logs }: LogTerminalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="animate-fade-in mt-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Prover Output
        </span>
      </div>
      <div
        ref={ref}
        className="log-terminal max-h-48 overflow-y-auto rounded-xl border border-gray-800 bg-[#0d1117] p-3 font-mono text-xs leading-relaxed text-emerald-400/90"
      >
        {logs.map((line, i) => (
          <div key={i} className="break-all">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
