import type { FlipResult } from "../../lib/types";
import TruncatedHash from "../shared/TruncatedHash";

interface ResultCardProps {
  result: FlipResult;
  betAmount: number;
  onPlayAgain: () => void;
}

export default function ResultCard({
  result,
  betAmount,
  onPlayAgain,
}: ResultCardProps) {
  const won = result.won;
  const payout = won ? betAmount * 2 : 0;

  return (
    <div
      className={`
        animate-fade-in mt-6 rounded-2xl border p-6 text-center
        ${
          won
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-red-500/30 bg-red-500/10"
        }
      `}
    >
      <div
        className={`text-3xl font-bold ${won ? "text-emerald-400" : "text-red-400"}`}
      >
        {won ? "YOU WIN!" : "YOU LOSE"}
      </div>

      <div className="mt-2 text-sm text-gray-300">
        Coin landed on{" "}
        <span className="font-semibold text-white">{result.outcome}</span>
        {" "}&middot; You bet{" "}
        <span className="font-semibold text-white">{result.bet}</span>
      </div>

      {won && (
        <div className="mt-2 text-lg font-semibold text-amber-400">
          +{payout.toFixed(1)} STRK
        </div>
      )}

      <div className="mt-4 space-y-1 text-xs text-gray-500">
        <div>
          Proof: {(result.proof_size / 1024).toFixed(0)} KB |{" "}
          <span className="inline-flex items-center gap-1">
            tx: <TruncatedHash hash={result.tx_hash} chars={6} />
          </span>
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="mt-5 rounded-xl bg-white/10 px-8 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/15"
      >
        Play Again
      </button>
    </div>
  );
}
