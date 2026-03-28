interface CoinAnimationProps {
  side: "heads" | "tails" | null;
  spinning: boolean;
}

export default function CoinAnimation({ side, spinning }: CoinAnimationProps) {
  const isHeads = side === "heads";
  const isTails = side === "tails";

  return (
    <div className="coin-perspective mx-auto">
      <div
        className={`
          relative mx-auto flex h-44 w-44 items-center justify-center rounded-full
          text-5xl font-bold transition-all duration-300
          ${spinning ? "animate-coin-spin shadow-[0_0_40px_rgba(251,191,36,0.5)]" : "shadow-[0_4px_24px_rgba(0,0,0,0.4)]"}
          ${
            spinning
              ? "bg-gradient-to-br from-amber-400 via-amber-600 to-amber-400 text-white"
              : isHeads
                ? "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900"
                : isTails
                  ? "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800"
                  : "bg-gradient-to-br from-gray-600 to-gray-700 text-gray-400"
          }
        `}
      >
        {/* Inner ring detail */}
        <div
          className={`
            absolute inset-3 rounded-full border-2
            ${spinning ? "border-amber-300/40" : isHeads ? "border-amber-600/30" : isTails ? "border-gray-400/30" : "border-gray-500/20"}
          `}
        />
        <span className="relative z-10">
          {spinning ? "?" : isHeads ? "H" : isTails ? "T" : "?"}
        </span>
      </div>
    </div>
  );
}
