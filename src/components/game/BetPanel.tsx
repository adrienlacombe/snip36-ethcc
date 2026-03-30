interface BetPanelProps {
  bet: 0 | 1;
  betAmount: number;
  balance: string | null;
  bankBalance: string | null;
  disabled: boolean;
  onBetChange: (bet: 0 | 1) => void;
  onAmountChange: (amount: number) => void;
  onFlip: () => void;
}

export default function BetPanel({
  bet,
  betAmount,
  balance,
  bankBalance,
  disabled,
  onBetChange,
  onAmountChange,
  onFlip,
}: BetPanelProps) {
  const minBet = 0.1;
  const balanceNum =
    balance === null ? null : Number.parseFloat(balance);
  const bankNum =
    bankBalance === null ? null : Number.parseFloat(bankBalance);

  // Max bet is min(player balance, bank balance / 2)
  // Bank needs to cover match (1x) + potential payout (2x) so must have >= 2x bet
  const limits: number[] = [];
  if (balanceNum !== null && !Number.isNaN(balanceNum)) limits.push(balanceNum);
  if (bankNum !== null && !Number.isNaN(bankNum)) limits.push(bankNum / 2);
  const maxBet = limits.length > 0 ? Math.max(0, Math.min(...limits)) : 0;

  const sliderMax =
    maxBet < minBet ? Math.max(1, betAmount) : Math.max(minBet, maxBet);
  const canAffordBet =
    maxBet >= minBet && betAmount <= maxBet;

  const bankLow = bankNum !== null && bankNum < betAmount;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Heads / Tails toggle */}
      <div className="flex justify-center gap-3">
        {([0, 1] as const).map((b) => (
          <button
            key={b}
            onClick={() => onBetChange(b)}
            disabled={disabled}
            className={`
              rounded-xl px-8 py-3 text-lg font-semibold transition
              ${
                bet === b
                  ? "border-2 border-amber-400 bg-amber-400/15 text-amber-400"
                  : "border-2 border-white/15 bg-white/5 text-gray-400 hover:border-white/30"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {b === 0 ? "Heads" : "Tails"}
          </button>
        ))}
      </div>

      {/* Bet amount */}
      <div className="mx-auto max-w-xs space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Bet amount</span>
          <span className="font-mono text-amber-400">
            {betAmount} STRK
          </span>
        </div>
        <input
          type="range"
          min={minBet}
          max={sliderMax}
          step="0.1"
          value={betAmount}
          onChange={(e) => onAmountChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-amber-400"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{minBet}</span>
          <span>{maxBet < minBet ? "..." : maxBet.toFixed(1)}</span>
        </div>
      </div>

      {/* Pot display */}
      <div className="text-center text-sm text-gray-400">
        Bank matches your bet &middot;{" "}
        <span className="font-semibold text-amber-400/90">
          Pot: {(betAmount * 2).toFixed(1)} STRK
        </span>
      </div>

      {/* Bank balance warning */}
      {bankLow && (
        <div className="text-center text-xs text-red-400">
          Bank only has {bankBalance} STRK — lower your bet
        </div>
      )}

      {/* Flip button */}
      <button
        onClick={onFlip}
        disabled={disabled || !canAffordBet}
        className={`
          mx-auto block rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500
          px-12 py-4 text-xl font-bold text-gray-900 shadow-lg
          transition hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-400/25
          ${disabled || !canAffordBet ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        Flip Coin
      </button>

      {/* Balances */}
      <div className="text-center text-xs text-gray-500 space-y-0.5">
        <div>
          Wallet: {balance === null ? "loading..." : `${balance} STRK`}
        </div>
        <div>
          Bank: {bankBalance === null ? "loading..." : `${bankBalance} STRK`}
        </div>
      </div>
    </div>
  );
}
