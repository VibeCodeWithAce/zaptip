"use client";

import { useState, useCallback } from "react";
import { mainnetTokens, Amount, type Address } from "starkzap";
import type { WalletInterface } from "starkzap";

export type TipToken = "STRK" | "ETH" | "USDC";

const tokenMap = {
  STRK: mainnetTokens.STRK,
  ETH: mainnetTokens.ETH,
  USDC: mainnetTokens.USDC,
} as const;

export interface TipState {
  isLoading: boolean;
  txHash: string | null;
  error: string | null;
}

export function useTip(wallet: WalletInterface | null) {
  const [state, setState] = useState<TipState>({
    isLoading: false,
    txHash: null,
    error: null,
  });

  const sendTip = useCallback(
    async (token: TipToken, amount: string, creatorAddress: string) => {
      if (!wallet) {
        setState({ isLoading: false, txHash: null, error: "WalletInterface not connected" });
        return;
      }

      setState({ isLoading: true, txHash: null, error: null });

      try {
        const tokenDef = tokenMap[token];
        const parsedAmount = Amount.parse(amount, tokenDef);

        if (parsedAmount.isZero()) {
          throw new Error("Amount must be greater than 0");
        }

        const transfers = [
          { to: creatorAddress as unknown as Address, amount: parsedAmount },
        ];

        const tx = await wallet.transfer(tokenDef, transfers, { feeMode: "user_pays" });

        setState({ isLoading: true, txHash: tx.hash, error: null });

        await tx.wait();
        setState({ isLoading: false, txHash: tx.hash, error: null });
      } catch (err) {
        console.error("[ZapTip] Transfer error:", err);
        setState({
          isLoading: false,
          txHash: null,
          error: err instanceof Error ? err.message : "Transfer failed",
        });
      }
    },
    [wallet]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, txHash: null, error: null });
  }, []);

  return { ...state, sendTip, reset };
}
