import type { GamePhase } from "./types";

export const EXPLORER_BASE = "https://sepolia.voyager.online/tx/";

export const SNIP36_LINK =
  "https://community.starknet.io/t/snip-36-in-protocol-proof-verification/116123";

export const PHASE_LABELS: Record<GamePhase, string> = {
  idle: "",
  committing: "Locking your bet...",
  seed_locked: "Seed block locked",
  depositing: "Approve deposit in your wallet...",
  matching: "Bank matching your deposit...",
  constructing: "Constructing transaction...",
  proving: "Generating STARK proof...",
  submitting: "Submitting proof to Starknet...",
  verifying: "Waiting for on-chain confirmation...",
  settling: "Settling payout on-chain...",
  complete: "Verified on-chain",
  error: "Error",
};

export const PIPELINE_STEPS: {
  phase: GamePhase;
  label: string;
  description: string;
}[] = [
  {
    phase: "committing",
    label: "Commit",
    description: "Bet locked cryptographically",
  },
  {
    phase: "seed_locked",
    label: "Seed Lock",
    description: "Block number locked as randomness source",
  },
  {
    phase: "depositing",
    label: "Deposit",
    description: "Approve & deposit STRK from wallet",
  },
  {
    phase: "matching",
    label: "Bank Match",
    description: "Bank matches your deposit",
  },
  {
    phase: "constructing",
    label: "Construct",
    description: "Transaction built off-chain",
  },
  {
    phase: "proving",
    label: "Prove",
    description: "stwo STARK proof generating",
  },
  {
    phase: "submitting",
    label: "Submit",
    description: "Proof sent to Starknet",
  },
  {
    phase: "verifying",
    label: "Verify",
    description: "Confirmed on-chain",
  },
  {
    phase: "settling",
    label: "Settle",
    description: "Winner paid on-chain",
  },
];
