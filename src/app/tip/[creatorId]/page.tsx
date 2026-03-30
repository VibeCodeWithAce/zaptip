"use client";

import { use, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useStarkzap } from "@/hooks/useStarkzap";
import TipWidget from "@/components/TipWidget";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Zap, Wallet, Loader2, Copy, Check } from "lucide-react";

function truncAddr(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function TipPage({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = use(params);
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";
  const { login, authenticated } = usePrivy();
  const [copied, setCopied] = useState(false);
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

  const content = (
    <div className="w-full max-w-sm space-y-6">
      {/* Tipper wallet info */}
      {wallet && !isEmbed && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground truncate">
              {truncAddr(wallet.address.toString())}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(wallet.address.toString());
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
          {balances.STRK && (
            <span className="text-xs text-muted-foreground ml-2 shrink-0">
              {balances.STRK.toFormatted(true)} STRK
            </span>
          )}
        </div>
      )}

      {/* Auth flow */}
      {!authenticated ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center space-y-4">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Sign in to tip
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect with Google, Twitter, or email to send a tip
            </p>
          </div>
          <Button size="lg" className="w-full h-11" onClick={login}>
            Sign In
          </Button>
        </div>
      ) : !wallet ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center space-y-4">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Connect Wallet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up your Starknet wallet to send tips
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
      ) : !isDeployed ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center space-y-4">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-yellow-500/10">
            <Wallet className="h-7 w-7 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Deploy Wallet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your wallet needs to be deployed before you can send tips.
              Fund it with STRK, then deploy.
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
      ) : (
        <TipWidget
          creatorAddress={creatorId}
          wallet={wallet}
          balances={balances}
          onRefreshBalances={() => refreshBalances()}
        />
      )}

      {/* Footer */}
      {isEmbed ? (
        <p className="text-center text-muted-foreground/60" style={{ fontSize: 12 }}>
          <Zap className="inline h-3 w-3 -mt-px mr-0.5" />
          Powered by ZapTip
        </p>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          Powered by ZapTip on Starknet
        </p>
      )}
    </div>
  );

  // Embed mode: minimal, no navbar
  if (isEmbed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        {content}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center bg-background p-4">
        {content}
      </main>
    </>
  );
}
