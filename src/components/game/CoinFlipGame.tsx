import type { GameState, GameAction } from "../../lib/types";
import CoinAnimation from "./CoinAnimation";
import BetPanel from "./BetPanel";
import ResultCard from "./ResultCard";

interface CoinFlipGameProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onFlip: () => void;
  onReset: () => void;
}

export default function CoinFlipGame({
  state,
  dispatch,
  onFlip,
  onReset,
}: CoinFlipGameProps) {
  const isPlaying = state.phase !== "idle" && state.phase !== "complete" && state.phase !== "error";
  const resultSide =
    state.result?.outcome === "heads"
      ? "heads"
      : state.result?.outcome === "tails"
        ? "tails"
        : null;

  return (
    <div className="space-y-6">
      {/* Coin */}
      <CoinAnimation
        side={isPlaying ? null : resultSide}
        spinning={isPlaying}
      />

      {/* Phase label during play */}
      {isPlaying && (
        <div className="text-center text-sm font-medium text-amber-400">
          {state.deploying
            ? "Setting up contract..."
            : phaseLabel(state.phase)}
        </div>
      )}

      {/* Result */}
      {state.phase === "complete" && state.result && (
        <ResultCard
          result={state.result}
          betAmount={state.betAmount}
          onPlayAgain={onReset}
        />
      )}

      {/* Error */}
      {state.error && (
        <div className="animate-fade-in mx-auto max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
          {state.error}
          <button
            onClick={onReset}
            className="mt-3 block w-full rounded-lg bg-white/10 py-2 text-xs text-gray-300 transition hover:bg-white/15"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Bet controls (hidden while playing) */}
      {!isPlaying && state.phase !== "complete" && !state.error && (
        <BetPanel
          bet={state.bet}
          betAmount={state.betAmount}
          balance={state.balance}
          bankBalance={state.bankBalance}
          disabled={isPlaying}
          onBetChange={(b) => dispatch({ type: "SET_BET", bet: b })}
          onAmountChange={(a) => dispatch({ type: "SET_BET_AMOUNT", amount: a })}
          onFlip={onFlip}
        />
      )}
    </div>
  );
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case "committing":
      return "Locking your bet...";
    case "seed_locked":
      return "Seed block locked";
    case "depositing":
      return "Approve deposit in your wallet...";
    case "matching":
      return "Bank matching your deposit...";
    case "constructing":
      return "Constructing transaction...";
    case "proving":
      return "Generating STARK proof...";
    case "submitting":
      return "Submitting proof to Starknet...";
    case "verifying":
      return "Waiting for on-chain confirmation...";
    case "settling":
      return "Settling payout on-chain...";
    default:
      return "Processing...";
  }
}
