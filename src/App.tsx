import { useEffect } from "react";
import { useWallet } from "./hooks/useWallet";
import { useGameState } from "./hooks/useGameState";
import { useCoinFlip } from "./hooks/useCoinFlip";
import { api } from "./lib/api";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CoinFlipGame from "./components/game/CoinFlipGame";
import CoinAnimation from "./components/game/CoinAnimation";
import PipelineVisualizer from "./components/pipeline/PipelineVisualizer";
import LogTerminal from "./components/pipeline/LogTerminal";
import HowItWorks from "./components/education/HowItWorks";
import ArchitectureDiagram from "./components/education/ArchitectureDiagram";
import TechCard from "./components/education/TechCard";
import FlipHistory from "./components/FlipHistory";
import WalletPicker from "./components/shared/WalletPicker";

export default function App() {
  const {
    address,
    walletProvider,
    walletPicker,
    handleConnect,
    handlePickWallet,
    handleDisconnect,
    dismissPicker,
  } = useWallet();

  const [state, dispatch] = useGameState();
  const { flip, reset } = useCoinFlip(
    dispatch,
    address,
    state.bet,
    state.betAmount,
    walletProvider,
  );

  // Sync wallet address into game state
  useEffect(() => {
    dispatch({ type: "SET_ADDRESS", address });
  }, [address, dispatch]);

  // Poll real STRK balance
  useEffect(() => {
    let disposed = false;
    let requestId = 0;

    if (!address) {
      dispatch({ type: "BALANCE_UPDATE", balance: null });
      return;
    }

    dispatch({ type: "BALANCE_UPDATE", balance: null });

    const fetchBalance = async () => {
      const currentRequestId = ++requestId;

      try {
        const resp = await api.playerBalance(address);
        if (!disposed && currentRequestId === requestId) {
          dispatch({ type: "BALANCE_UPDATE", balance: resp.balance });
        }
      } catch {
        // Ignore transient balance fetch failures and retry on the next poll.
      }
    };

    fetchBalance();
    const interval = window.setInterval(fetchBalance, 15000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [address, dispatch]);

  const isPlaying =
    state.phase !== "idle" &&
    state.phase !== "complete" &&
    state.phase !== "error";

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Header
        address={address}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Wallet picker modal */}
      {walletPicker && (
        <WalletPicker
          wallets={walletPicker}
          onPick={handlePickWallet}
          onDismiss={dismissPicker}
        />
      )}

      {!address ? (
        /* -- Not connected: landing view -- */
        <div className="mt-16 space-y-12">
          <div className="text-center">
            <CoinAnimation side={null} spinning={false} />
            <p className="mt-6 text-gray-400">
              Connect your Starknet wallet to play
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Provably fair coin flip powered by SNIP-36 virtual blocks
            </p>
          </div>

          <ArchitectureDiagram />
          <HowItWorks />

          <TechCard title="What is SNIP-36?">
            <p>
              SNIP-36 adds native STARK proof verification to Starknet's
              protocol layer. Transactions can include a proof that
              cryptographically guarantees off-chain computation was executed
              correctly. This enables verifiable computation oracles, provable
              games, and privacy-preserving applications &mdash; all without
              trusting a centralized server.
            </p>
            <p className="mt-2">
              The coin flip game demonstrates this: the game logic runs
              off-chain in a "virtual block", the stwo prover generates a STARK
              proof, and Starknet verifies it on-chain. No one can cheat.
            </p>
          </TechCard>

          <TechCard title="Technical details: Commit-Reveal scheme">
            <p>
              To prevent front-running, the game uses a commit-reveal protocol.
              The player commits <code className="text-gray-300">pedersen(bet, nonce)</code> before
              the seed block is locked. After the seed is fixed, the player
              reveals the bet and nonce. The server verifies the commitment
              matches, ensuring neither party can cheat.
            </p>
            <p className="mt-2">
              The outcome is deterministic: <code className="text-gray-300">pedersen(block_number, player_address) % 2</code>.
              Anyone can independently verify the result given the public
              inputs.
            </p>
          </TechCard>

          <TechCard title="Technical details: Real STRK Settlement">
            <p>
              When you play, your STRK tokens are deposited into the CoinFlipBank
              settlement contract. The bank matches your bet. After the SNIP-36
              proof is verified on-chain, the settlement contract recomputes the
              deterministic outcome and pays the winner 2x the bet amount.
            </p>
            <p className="mt-2">
              All token transfers are real on-chain transactions that you sign
              with your wallet. The STARK proof guarantees the game was played
              honestly &mdash; no trust required.
            </p>
          </TechCard>
        </div>
      ) : (
        /* -- Connected: game view -- */
        <div className="space-y-8">
          <CoinFlipGame
            state={state}
            dispatch={dispatch}
            onFlip={flip}
            onReset={reset}
          />

          {state.phase !== "idle" && (
            <div className="space-y-2">
              <PipelineVisualizer
                currentPhase={state.phase}
                timings={state.pipelineTimings}
              />
              {(isPlaying || state.logs.length > 0) && (
                <LogTerminal logs={state.logs} />
              )}
            </div>
          )}

          <FlipHistory history={state.history} />

          <div className="space-y-4 pt-4">
            <ArchitectureDiagram />
            <HowItWorks />
          </div>

          <TechCard title="About this demo">
            <p>
              Real STRK tokens are deposited into the CoinFlipBank settlement
              contract. The bank matches your bet, and the winner receives 2x
              the bet amount after the SNIP-36 proof is verified on-chain.
            </p>
            <p className="mt-2">
              The STARK proof guarantees the coin flip was computed honestly.
              The proof is ~200-300 KB and takes 30-120 seconds to generate.
              Once submitted, Starknet's protocol-level verifier confirms
              validity, and the settlement contract pays out trustlessly.
            </p>
          </TechCard>
        </div>
      )}

      <Footer />
    </div>
  );
}
