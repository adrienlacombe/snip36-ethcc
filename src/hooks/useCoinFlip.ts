import { useCallback, useEffect, useRef } from "react";
import { hash } from "starknet";
import { api } from "../lib/api";
import type { GameAction, FlipResult } from "../lib/types";

export function useCoinFlip(
  dispatch: React.Dispatch<GameAction>,
  address: string | null,
  bet: 0 | 1,
  betAmount: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletProvider: React.RefObject<any>,
) {
  const sourceRef = useRef<EventSource | null>(null);
  const latestAddressRef = useRef(address);
  const reconnectingRef = useRef(false);

  useEffect(() => {
    latestAddressRef.current = address;
  }, [address]);

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
      reconnectingRef.current = false;
    };
  }, []);

  const flip = useCallback(async () => {
    if (!address) return;

    dispatch({ type: "START_FLIP" });

    // Auto-deploy CoinFlip + Bank if needed
    try {
      const status = await api.coinflipStatus();
      if (!status.deployed) {
        dispatch({ type: "DEPLOYING" });
        dispatch({ type: "LOG_APPEND", line: "Deploying CoinFlip contract..." });
        await api.deployCoinflip();
        dispatch({ type: "LOG_APPEND", line: "CoinFlip contract deployed." });
      }

      const bankStatus = await api.bankStatus();
      if (!bankStatus.deployed) {
        dispatch({ type: "DEPLOYING" });
        dispatch({ type: "LOG_APPEND", line: "Deploying CoinFlipBank contract (one-time setup)..." });
        await api.deployBank();
        dispatch({ type: "LOG_APPEND", line: "CoinFlipBank deployed and funded." });
      }

      dispatch({ type: "DEPLOY_DONE" });
    } catch (e) {
      dispatch({ type: "ERROR", message: `Deploy failed: ${e}` });
      return;
    }

    // Generate random nonce
    const nonceBytes = new Uint8Array(31);
    crypto.getRandomValues(nonceBytes);
    const nonce =
      "0x" +
      Array.from(nonceBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    // Compute commitment = pedersen(bet, nonce)
    const commitment = hash.computePedersenHash(
      "0x" + bet.toString(16),
      nonce,
    );

    dispatch({
      type: "LOG_APPEND",
      line: `Committing bet (commitment: ${commitment.slice(0, 18)}...)`,
    });

    // Commit phase
    let sessionId: string;
    try {
      const commitResp = await api.commit(commitment, address);
      sessionId = commitResp.session_id;
      dispatch({
        type: "COMMIT_SUCCESS",
        sessionId: commitResp.session_id,
        seedBlock: commitResp.seed_block,
      });
      dispatch({
        type: "LOG_APPEND",
        line: `Seed locked at block ${commitResp.seed_block}`,
      });
    } catch (e) {
      dispatch({ type: "ERROR", message: `Commit failed: ${e}` });
      return;
    }

    // Deposit phase: approve + deposit STRK via wallet
    try {
      dispatch({ type: "PHASE_UPDATE", phase: "depositing" });
      dispatch({ type: "LOG_APPEND", line: "Getting deposit info..." });

      const depositInfo = await api.depositInfo(sessionId, betAmount);

      dispatch({
        type: "LOG_APPEND",
        line: `Please approve ${betAmount} STRK deposit in your wallet...`,
      });

      const provider = walletProvider.current;
      if (!provider) {
        throw new Error("Wallet not connected");
      }

      // Multicall: approve + deposit (user signs once)
      const betHex = "0x" + bet.toString(16);
      const depositResult = await provider.request({
        type: "wallet_addInvokeTransaction",
        params: {
          calls: [
            {
              contract_address: depositInfo.strk_address,
              entry_point: "approve",
              calldata: [
                depositInfo.bank_address,
                depositInfo.bet_amount_low,
                depositInfo.bet_amount_high,
              ],
            },
            {
              contract_address: depositInfo.bank_address,
              entry_point: "deposit",
              calldata: [
                depositInfo.session_felt,
                depositInfo.bet_amount_low,
                depositInfo.bet_amount_high,
                depositInfo.seed,
                betHex,
              ],
            },
          ],
        },
      });

      const depositTxHash = depositResult.transaction_hash;
      dispatch({
        type: "LOG_APPEND",
        line: `Deposit tx: ${depositTxHash.slice(0, 18)}...`,
      });

      // Wait for deposit confirmation + bank match
      dispatch({ type: "PHASE_UPDATE", phase: "matching" });
      dispatch({ type: "LOG_APPEND", line: "Bank matching your deposit..." });

      const confirmation = await api.confirmDeposit(sessionId, depositTxHash);
      dispatch({
        type: "LOG_APPEND",
        line: `Bank matched (tx: ${confirmation.match_tx_hash.slice(0, 18)}...)`,
      });
    } catch (e) {
      dispatch({ type: "ERROR", message: `Deposit failed: ${e}` });
      return;
    }

    // Reveal + play via SSE (existing flow)
    const source = api.play(sessionId, address, bet, nonce);
    sourceRef.current = source;
    reconnectingRef.current = false;

    source.addEventListener("open", () => {
      if (sourceRef.current !== source) return;
      if (reconnectingRef.current) {
        reconnectingRef.current = false;
        dispatch({ type: "LOG_APPEND", line: "Connection restored." });
      }
    });

    source.addEventListener("log", (e: MessageEvent) => {
      if (sourceRef.current !== source) return;
      dispatch({ type: "LOG_APPEND", line: e.data });
    });

    source.addEventListener("phase", (e: MessageEvent) => {
      if (sourceRef.current !== source) return;
      dispatch({ type: "PHASE_UPDATE", phase: e.data });
    });

    source.addEventListener("result", (e: MessageEvent) => {
      if (sourceRef.current !== source) return;

      const data: FlipResult = JSON.parse(e.data);
      dispatch({ type: "RESULT_RECEIVED", result: data });
      source.close();
      sourceRef.current = null;
      reconnectingRef.current = false;

      // Refresh balance after game
      const currentAddress = latestAddressRef.current;
      if (currentAddress) {
        api.playerBalance(currentAddress).then((resp) => {
          dispatch({ type: "BALANCE_UPDATE", balance: resp.balance });
        }).catch(() => {});
      }
    });

    source.addEventListener("error", (event: Event) => {
      if (sourceRef.current !== source) return;

      if (event instanceof MessageEvent) {
        const message =
          typeof event.data === "string" && event.data.length > 0
            ? event.data
            : "Game session failed";
        dispatch({ type: "ERROR", message });
        source.close();
        sourceRef.current = null;
        reconnectingRef.current = false;
        return;
      }

      if (source.readyState === EventSource.CLOSED) {
        dispatch({
          type: "ERROR",
          message: "Connection to the game server was lost.",
        });
        source.close();
        sourceRef.current = null;
        reconnectingRef.current = false;
        return;
      }

      if (!reconnectingRef.current) {
        reconnectingRef.current = true;
        dispatch({
          type: "LOG_APPEND",
          line: "Connection interrupted. Reconnecting to the game server...",
        });
      }
    });
  }, [address, bet, betAmount, dispatch, walletProvider]);

  const reset = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    reconnectingRef.current = false;
    dispatch({ type: "RESET" });
  }, [dispatch]);

  return { flip, reset };
}
