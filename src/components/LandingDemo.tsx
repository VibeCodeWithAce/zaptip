"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useStarkzap } from "@/hooks/useStarkzap";
import TipWidget from "@/components/TipWidget";
import { Button } from "@/components/ui/button";
import { Zap, Wallet, Loader2 } from "lucide-react";

interface LandingDemoProps {
  creatorAddress: string;
}

export default function LandingDemo({ creatorAddress }: LandingDemoProps) {
  const { login, authenticated } = usePrivy();
  const {
    wallet,
    isConnecting,
    isDeploying,
    isDeployed,
    balances,
    connect,
    deploy,
    refreshBalances,
  } = useStarkzap();

  if (!authenticated) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center space-y-4">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Send a live tip
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with Google, Twitter, or email to try it
            </p>
          </div>
          <Button size="lg" className="w-full h-11" onClick={login}>
            Sign In to Try
          </Button>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center space-y-4">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Connect Wallet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up your Starknet wallet to send a tip
            </p>
          </div>
          <Button
            size="lg"
            className="w-full h-11"
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (!isDeployed) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center space-y-4">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-yellow-500/10">
            <Wallet className="h-7 w-7 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Deploy Wallet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fund your wallet from the{" "}
              <a
                href="https://starknet-faucet.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Sepolia faucet
              </a>
              , then deploy.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => refreshBalances()}
            >
              Refresh
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={deploy}
              disabled={isDeploying}
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                "Deploy"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TipWidget
      creatorAddress={creatorAddress}
      wallet={wallet}
      balances={balances}
      onRefreshBalances={() => refreshBalances()}
    />
  );
}
