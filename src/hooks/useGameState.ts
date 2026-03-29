import { useReducer } from "react";
import type { GameState, GameAction } from "../lib/types";

const MIN_BET = 0.1;
const MAX_BET = 100;

const initialState: GameState = {
  phase: "idle",
  address: null,
  bet: 0,
  betAmount: 1,
  balance: null,
  sessionId: null,
  seedBlock: null,
  logs: [],
  result: null,
  error: null,
  history: [],
  pipelineTimings: {},
  contractDeployed: false,
  bankDeployed: false,
  deploying: false,
  bankBalance: null,
};

function clampBetAmount(amount: number, balance: string | null): number {
  const roundedAmount = Math.round(amount * 10) / 10;
  const parsedBalance =
    balance === null ? Number.NaN : Number.parseFloat(balance);
  const maxBet = Number.isNaN(parsedBalance)
    ? MAX_BET
    : Math.min(MAX_BET, Math.max(0, parsedBalance));
  const upperBound = Math.max(MIN_BET, maxBet);

  return Math.min(Math.max(roundedAmount, MIN_BET), upperBound);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_ADDRESS":
      return { ...state, address: action.address };

    case "SET_BET":
      return { ...state, bet: action.bet };

    case "SET_BET_AMOUNT":
      return {
        ...state,
        betAmount: clampBetAmount(action.amount, state.balance),
      };

    case "START_FLIP":
      return {
        ...state,
        phase: "committing",
        result: null,
        error: null,
        logs: [],
        sessionId: null,
        seedBlock: null,
        pipelineTimings: { committing: Date.now() },
      };

    case "DEPLOYING":
      return { ...state, deploying: true };

    case "DEPLOY_DONE":
      return { ...state, deploying: false, contractDeployed: true, bankDeployed: true };

    case "COMMIT_SUCCESS":
      return {
        ...state,
        phase: "seed_locked",
        sessionId: action.sessionId,
        seedBlock: action.seedBlock,
        pipelineTimings: {
          ...state.pipelineTimings,
          seed_locked: Date.now(),
        },
      };

    case "PHASE_UPDATE": {
      const phase = mapServerPhase(action.phase);
      return {
        ...state,
        phase,
        pipelineTimings: {
          ...state.pipelineTimings,
          [phase]: state.pipelineTimings[phase] ?? Date.now(),
        },
      };
    }

    case "LOG_APPEND":
      return { ...state, logs: [...state.logs, action.line] };

    case "RESULT_RECEIVED":
      return {
        ...state,
        phase: "complete",
        result: action.result,
        history: [action.result, ...state.history],
        pipelineTimings: {
          ...state.pipelineTimings,
          complete: Date.now(),
        },
      };

    case "ERROR":
      return {
        ...state,
        phase: "error",
        error: action.message,
        deploying: false,
      };

    case "RESET":
      return {
        ...initialState,
        address: state.address,
        betAmount: clampBetAmount(initialState.betAmount, state.balance),
        balance: state.balance,
        bankBalance: state.bankBalance,
        history: state.history,
        contractDeployed: state.contractDeployed,
        bankDeployed: state.bankDeployed,
      };

    case "BALANCE_UPDATE":
      return {
        ...state,
        balance: action.balance,
        betAmount: clampBetAmount(state.betAmount, action.balance),
      };

    case "BANK_BALANCE_UPDATE":
      return {
        ...state,
        bankBalance: action.bankBalance,
      };

    default:
      return state;
  }
}

function mapServerPhase(phase: string): GameState["phase"] {
  switch (phase) {
    case "depositing":
      return "depositing";
    case "matching":
      return "matching";
    case "constructing":
      return "constructing";
    case "proving":
      return "proving";
    case "submitting":
      return "submitting";
    case "verifying":
      return "verifying";
    case "settling":
      return "settling";
    default:
      return "proving";
  }
}

export function useGameState() {
  return useReducer(gameReducer, initialState);
}
