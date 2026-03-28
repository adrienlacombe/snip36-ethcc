import WalletButton from "./shared/WalletButton";

interface HeaderProps {
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({
  address,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  return (
    <header className="mb-10 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-amber-400">
          SNIP-36 CoinFlip
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Provably fair coin flip powered by zero-knowledge proofs
        </p>
      </div>
      <WalletButton
        address={address}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />
    </header>
  );
}
