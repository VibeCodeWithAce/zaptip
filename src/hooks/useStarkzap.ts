"use client";

import { useState, useCallback, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  StarkZap,
  OnboardStrategy,
  sepoliaTokens,
  type Amount,
} from "starkzap";
import type { WalletInterface } from "starkzap";

let sdkInstance: StarkZap | null = null;

function getSDK(): StarkZap {
  if (!sdkInstance) {
    const avnuApiKey = process.env.NEXT_PUBLIC_AVNU_API_KEY;
    console.log("AVNU KEY:", avnuApiKey);
    sdkInstance = new StarkZap({
      network: "sepolia",
      paymaster: {
        nodeUrl: "https://sepolia.paymaster.avnu.fi",
        headers: { "x-paymaster-api-key": avnuApiKey ?? "" },
      },
    });
  }
  return sdkInstance;
}

export interface StarkzapState {
  wallet: WalletInterface | null;
  address: string | null;
  isConnecting: boolean;
  isDeploying: boolean;
  isDeployed: boolean;
  error: string | null;
  balances: {
    STRK: Amount | null;
    ETH: Amount | null;
    USDC: Amount | null;
  };
}

export function useStarkzap() {
  const { authenticated, getAccessToken } = usePrivy();
  const [state, setState] = useState<StarkzapState>({
    wallet: null,
    address: null,
    isConnecting: false,
    isDeploying: false,
    isDeployed: false,
    error: null,
    balances: { STRK: null, ETH: null, USDC: null },
  });
  const walletRef = useRef<WalletInterface | null>(null);

  const connect = useCallback(async () => {
    if (!authenticated) {
      setState((s) => ({ ...s, error: "Not authenticated" }));
      return;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      const sdk = getSDK();
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Failed to get access token");

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Connection timed out (30s)")), 30000)
      );

      const onboard = sdk.onboard({
        strategy: OnboardStrategy.Privy,
        privy: {
          resolve: async () => {
            const res = await fetch("/api/signer-context", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            });
            if (!res.ok) {
              const body = await res.json().catch(() => ({}));
              throw new Error(body.error || `Signer context failed: ${res.status}`);
            }
            return res.json();
          },
        },
        accountPreset: "openzeppelin",
        feeMode: "sponsored",
        deploy: "if_needed",
      });

      const { wallet, deployed } = await Promise.race([onboard, timeout]);
      walletRef.current = wallet;

      setState((s) => ({
        ...s,
        wallet,
        address: wallet.address.toString(),
        isConnecting: false,
        isDeployed: deployed,
      }));

      refreshBalances(wallet);
    } catch (error) {
      console.error("[ZapTip] Connect error:", error);
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Connection failed",
      }));
    }
  }, [authenticated, getAccessToken]);

  const deploy = useCallback(async () => {
    const wallet = walletRef.current;
    if (!wallet) return;

    setState((s) => ({ ...s, isDeploying: true, error: null }));

    try {
      await wallet.ensureReady({
        deploy: "if_needed",
        feeMode: "sponsored",
      });
      setState((s) => ({ ...s, isDeploying: false, isDeployed: true }));
      refreshBalances(wallet);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes("already deployed")) {
        setState((s) => ({ ...s, isDeploying: false, isDeployed: true }));
        refreshBalances(wallet);
        return;
      }
      console.error("[ZapTip] Deploy error:", error);
      setState((s) => ({ ...s, isDeploying: false, error: msg }));
    }
  }, []);

  const refreshBalances = useCallback(async (w?: WalletInterface) => {
    const wallet = w || walletRef.current;
    if (!wallet) return;

    try {
      const [strk, eth, usdc] = await Promise.all([
        wallet.balanceOf(sepoliaTokens.STRK),
        wallet.balanceOf(sepoliaTokens.ETH),
        wallet.balanceOf(sepoliaTokens.USDC),
      ]);
      setState((s) => ({
        ...s,
        balances: { STRK: strk, ETH: eth, USDC: usdc },
      }));
    } catch (error) {
      console.error("Balance fetch error:", error);
    }
  }, []);

  return {
    ...state,
    connect,
    deploy,
    refreshBalances,
    sdk: getSDK(),
  };
}
