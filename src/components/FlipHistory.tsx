import type { FlipResult } from "../lib/types";
import TruncatedHash from "./shared/TruncatedHash";

interface FlipHistoryProps {
  history: FlipResult[];
}

export default function FlipHistory({ history }: FlipHistoryProps) {
  if (history.length === 0) return null;

  const wins = history.filter((h) => h.won).length;
  const losses = history.length - wins;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400">Game History</h3>
        <div className="text-xs text-gray-500">
          <span className="text-emerald-400">{wins}W</span>
          {" / "}
          <span className="text-red-400">{losses}L</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {history.map((h, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2 font-mono text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-500">#{history.length - i}</span>
              <span className="text-gray-400">
                bet:{h.bet} &rarr; {h.outcome}
              </span>
              <span className="text-gray-600">
                {(h.proof_size / 1024).toFixed(0)}KB
              </span>
            </div>
            <div className="flex items-center gap-3">
              <TruncatedHash hash={h.tx_hash} chars={4} />
              <span
                className={`font-semibold ${h.won ? "text-emerald-400" : "text-red-400"}`}
              >
                {h.won ? "WIN" : "LOSE"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
