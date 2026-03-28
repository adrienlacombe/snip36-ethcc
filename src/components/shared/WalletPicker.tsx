import type { WalletOption } from "../../lib/types";

interface WalletPickerProps {
  wallets: WalletOption[];
  onPick: (wallet: WalletOption) => void;
  onDismiss: () => void;
}

export default function WalletPicker({
  wallets,
  onPick,
  onDismiss,
}: WalletPickerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onDismiss}
    >
      <div
        className="min-w-[280px] rounded-2xl border border-white/10 bg-gray-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-100">
          Choose a wallet
        </h3>
        {wallets.map((w) => (
          <button
            key={w.id}
            onClick={() => onPick(w)}
            className="mb-2 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-gray-200 transition hover:bg-white/10"
          >
            {w.icon && (
              <img
                src={typeof w.icon === "string" ? w.icon : w.icon.dark}
                alt=""
                className="h-7 w-7 rounded-md"
              />
            )}
            {w.name}
          </button>
        ))}
      </div>
    </div>
  );
}
