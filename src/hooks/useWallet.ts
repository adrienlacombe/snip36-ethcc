import { useState, useCallback, useRef } from "react";
import type { WalletOption } from "../lib/types";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [walletPicker, setWalletPicker] = useState<WalletOption[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walletProviderRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connectWallet = useCallback(async (sn: any, wallet: any) => {
    const enabled = await sn.enable(wallet);
    walletProviderRef.current = enabled; // Store for transaction signing
    const accounts: string[] = await enabled.request({
      type: "wallet_requestAccounts",
    });
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      setWalletPicker(null);
    }
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      const { getStarknet } = await import("get-starknet-core");
      const sn = getStarknet();
      snRef.current = sn;
      const wallets = await sn.getAvailableWallets();
      if (wallets.length === 0) {
        throw new Error("No Starknet wallet found. Install ArgentX or Braavos.");
      }
      if (wallets.length === 1) {
        await connectWallet(sn, wallets[0]);
      } else {
        setWalletPicker(
          wallets.map((w) => ({
            id: w.id,
            name: w.name || w.id,
            icon: w.icon,
            _raw: w,
          })),
        );
      }
    } catch (e) {
      console.error("Wallet connection failed:", e);
      throw e;
    }
  }, [connectWallet]);

  const handlePickWallet = useCallback(
    async (wallet: WalletOption) => {
      const { getStarknet } = await import("get-starknet-core");
      const sn = snRef.current || getStarknet();
      await connectWallet(sn, wallet._raw);
    },
    [connectWallet],
  );

  const handleDisconnect = useCallback(() => {
    walletProviderRef.current = null;
    setWalletPicker(null);
    setAddress(null);
  }, []);

  const dismissPicker = useCallback(() => {
    setWalletPicker(null);
  }, []);

  return {
    address,
    walletProvider: walletProviderRef,
    walletPicker,
    handleConnect,
    handlePickWallet,
    handleDisconnect,
    dismissPicker,
  };
}
