"use client";

import { useState, useCallback, useRef } from "react";
import {
  TongoConfidential,
  type ConfidentialState,
  type ConfidentialRecipient,
  type Address,
} from "starkzap";
import type { WalletInterface } from "starkzap";
import { TONGO_CONTRACT_ADDRESS } from "@/lib/tongo";

export interface UseConfidentialReturn {
  isInitializing: boolean;
  confidential: TongoConfidential | null;
  recipientId: ConfidentialRecipient | null;
  tongoAddress: string | null;
  state: ConfidentialState | null;
  isLoadingState: boolean;
  initialize: (accessToken: string) => Promise<TongoConfidential | null>;
  refreshState: () => Promise<void>;
  error: string | null;
}

export function useConfidential(wallet: WalletInterface | null): UseConfidentialReturn {
  const [isInitializing, setIsInitializing] = useState(false);
  const [confidential, setConfidential] = useState<TongoConfidential | null>(null);
  const [recipientId, setRecipientId] = useState<ConfidentialRecipient | null>(null);
  const [tongoAddress, setTongoAddress] = useState<string | null>(null);
  const [state, setState] = useState<ConfidentialState | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const instanceRef = useRef<TongoConfidential | null>(null);

  const initialize = useCallback(
    async (accessToken: string): Promise<TongoConfidential | null> => {
      if (instanceRef.current) return instanceRef.current;
      if (!wallet) {
        setError("Wallet not connected");
        return null;
      }

      setIsInitializing(true);
      setError(null);

      try {
        // Fetch or generate the Tongo private key
        const res = await fetch("/api/tongo-key", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to get Tongo key");
        }
        const { key } = await res.json();

        const instance = new TongoConfidential({
          privateKey: key,
          contractAddress: TONGO_CONTRACT_ADDRESS as Address,
          provider: wallet.getProvider(),
        });

        instanceRef.current = instance;
        setConfidential(instance);
        setRecipientId(instance.recipientId);
        setTongoAddress(instance.address);
        setIsInitializing(false);

        return instance;
      } catch (err) {
        console.error("[useConfidential] init error:", err);
        setError(err instanceof Error ? err.message : "Initialization failed");
        setIsInitializing(false);
        return null;
      }
    },
    [wallet]
  );

  const refreshState = useCallback(async () => {
    const inst = instanceRef.current;
    if (!inst) return;

    setIsLoadingState(true);
    try {
      const s = await inst.getState();
      setState(s);
    } catch (err) {
      console.error("[useConfidential] state error:", err);
    } finally {
      setIsLoadingState(false);
    }
  }, []);

  return {
    isInitializing,
    confidential,
    recipientId,
    tongoAddress,
    state,
    isLoadingState,
    initialize,
    refreshState,
    error,
  };
}
