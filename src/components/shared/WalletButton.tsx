interface WalletButtonProps {
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

function truncate(hex: string, chars = 6): string {
  if (hex.length <= chars * 2 + 4) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

export default function WalletButton({
  address,
  onConnect,
  onDisconnect,
}: WalletButtonProps) {
  if (address) {
    return (
      <button
        onClick={onDisconnect}
        className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-mono text-sm text-gray-200 transition hover:bg-white/15"
      >
        {truncate(address)}
      </button>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:from-amber-300 hover:to-amber-400"
    >
      Connect Wallet
    </button>
  );
}
