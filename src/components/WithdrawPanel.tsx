import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import TruncatedHash from "./shared/TruncatedHash";

interface WithdrawPanelProps {
  address: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletProvider: React.RefObject<any>;
  /** Incremented each time a game completes to trigger immediate refresh */
  refreshKey?: number;
}

export default function WithdrawPanel({
  address,
  walletProvider,
  refreshKey,
}: WithdrawPanelProps) {
  const [winnings, setWinnings] = useState<string | null>(null);
  const [bankAddress, setBankAddress] = useState<string>("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWinnings = useCallback(async () => {
    try {
      const resp = await api.playerWinnings(address);
      setWinnings(resp.winnings);
      setBankAddress(resp.bank_address);
    } catch {
      // Bank may not be deployed yet
    }
  }, [address]);

  useEffect(() => {
    fetchWinnings();
    const interval = setInterval(fetchWinnings, 15000);
    return () => clearInterval(interval);
  }, [fetchWinnings, refreshKey]);

  const handleWithdraw = async () => {
    const provider = walletProvider.current;
    if (!provider || !bankAddress) return;

    setWithdrawing(true);
    setError(null);
    setTxHash(null);

    try {
      const result = await provider.request({
        type: "wallet_addInvokeTransaction",
        params: {
          calls: [
            {
              contract_address: bankAddress,
              entry_point: "withdraw",
              calldata: [],
            },
          ],
        },
      });
      setTxHash(result.transaction_hash);
      // Refresh after a delay
      setTimeout(fetchWinnings, 20000);
    } catch (e) {
      setError(`Withdraw failed: ${e}`);
    } finally {
      setWithdrawing(false);
    }
  };

  const winningsNum = winnings ? parseFloat(winnings) : 0;
  if (winningsNum <= 0) return null;

  return (
    <div className="animate-fade-in rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-emerald-400">
            Winnings available
          </div>
          <div className="mt-1 text-2xl font-bold text-white">
            {winnings} STRK
          </div>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={withdrawing}
          className={`
            rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white
            transition hover:bg-emerald-400
            ${withdrawing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {withdrawing ? "Withdrawing..." : "Withdraw"}
        </button>
      </div>

      {txHash && (
        <div className="mt-3 text-xs text-gray-400">
          Withdraw tx: <TruncatedHash hash={txHash} />
        </div>
      )}

      {error && (
        <div className="mt-3 text-xs text-red-400">{error}</div>
      )}
    </div>
  );
}
