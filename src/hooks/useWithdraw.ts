"use client";

import { useState, useCallback } from "react";
import { sepoliaTokens, Amount, type Address } from "starkzap";
import type { WalletInterface } from "starkzap";

export type WithdrawToken = "STRK" | "ETH" | "USDC";

const tokenMap = {
  STRK: sepoliaTokens.STRK,
  ETH: sepoliaTokens.ETH,
  USDC: sepoliaTokens.USDC,
} as const;

export interface WithdrawState {
  isLoading: boolean;
  txHash: string | null;
  error: string | null;
}

export function useWithdraw(wallet: WalletInterface | null) {
  const [state, setState] = useState<WithdrawState>({
    isLoading: false,
    txHash: null,
    error: null,
  });

  const withdraw = useCallback(
    async (token: WithdrawToken, amount: string, toAddress: string) => {
      if (!wallet) {
        setState({ isLoading: false, txHash: null, error: "Wallet not connected" });
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
          { to: toAddress as unknown as Address, amount: parsedAmount },
        ];

        const tx = await wallet.transfer(tokenDef, transfers);
        setState({ isLoading: true, txHash: tx.hash, error: null });

        await tx.wait();
        setState({ isLoading: false, txHash: tx.hash, error: null });
      } catch (err) {
        console.error("[ZapTip] Withdraw error:", err);
        setState({
          isLoading: false,
          txHash: null,
          error: err instanceof Error ? err.message : "Withdraw failed",
        });
      }
    },
    [wallet]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, txHash: null, error: null });
  }, []);

  return { ...state, withdraw, reset };
}
