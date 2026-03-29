export type GamePhase =
  | "idle"
  | "committing"
  | "seed_locked"
  | "depositing"
  | "matching"
  | "constructing"
  | "proving"
  | "submitting"
  | "verifying"
  | "settling"
  | "complete"
  | "error";

export interface FlipResult {
  outcome: "heads" | "tails";
  bet: "heads" | "tails";
  won: boolean;
  tx_hash: string;
  settle_tx_hash?: string;
  proof_size: number;
  seed: string;
  player: string;
}

export interface GameState {
  phase: GamePhase;
  address: string | null;
  bet: 0 | 1;
  betAmount: number;
  balance: string | null; // real STRK balance from RPC, null = loading
  sessionId: string | null;
  seedBlock: number | null;
  logs: string[];
  result: FlipResult | null;
  error: string | null;
  history: FlipResult[];
  pipelineTimings: Record<string, number>;
  contractDeployed: boolean;
  bankDeployed: boolean;
  deploying: boolean;
  bankBalance: string | null; // bank's STRK balance, caps max bet
}

export type GameAction =
  | { type: "SET_ADDRESS"; address: string | null }
  | { type: "SET_BET"; bet: 0 | 1 }
  | { type: "SET_BET_AMOUNT"; amount: number }
  | { type: "START_FLIP" }
  | { type: "DEPLOYING" }
  | { type: "DEPLOY_DONE" }
  | { type: "COMMIT_SUCCESS"; sessionId: string; seedBlock: number }
  | { type: "PHASE_UPDATE"; phase: GamePhase }
  | { type: "LOG_APPEND"; line: string }
  | { type: "RESULT_RECEIVED"; result: FlipResult }
  | { type: "ERROR"; message: string }
  | { type: "RESET" }
  | { type: "BALANCE_UPDATE"; balance: string | null }
  | { type: "BANK_BALANCE_UPDATE"; bankBalance: string | null };

export interface WalletOption {
  id: string;
  name: string;
  icon?: string | { dark: string; light: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _raw: any;
}
