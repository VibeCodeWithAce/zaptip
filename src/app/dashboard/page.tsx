"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useStarkzap } from "@/hooks/useStarkzap";
import { useWithdraw, type WithdrawToken } from "@/hooks/useWithdraw";
import { useConfidential } from "@/hooks/useConfidential";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import type { Amount as AmountType } from "starkzap";
import { type Address } from "starkzap";
import {
  Wallet,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Zap,
  Share2,
  Code2,
  ShieldCheck,
  ArrowDownToLine,
} from "lucide-react";

const TIP_BASE_URL = "https://zaptip.vercel.app/tip/";
const EXPLORER_BASE = "https://voyager.online/tx/";

function truncAddr(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const TOKENS: { id: WithdrawToken; label: string; icon: string }[] = [
  { id: "STRK", label: "STRK", icon: "S" },
  { id: "ETH", label: "ETH", icon: "E" },
  { id: "USDC", label: "USDC", icon: "$" },
];

export default function DashboardPage() {
  const { login, authenticated, user, getAccessToken } = usePrivy();
  const {
    wallet,
    address,
    isConnecting,
    isDeploying,
    isDeployed,
    balances,
    connect,
    deploy,
    refreshBalances,
  } = useStarkzap();

  const { isLoading: isWithdrawing, txHash, error: withdrawError, withdraw, reset: resetWithdraw } = useWithdraw(wallet);
  const {
    isInitializing: isConfidentialInit,
    confidential,
    recipientId,
    tongoAddress,
    state: confidentialState,
    isLoadingState: isConfidentialLoading,
    initialize: initConfidential,
    refreshState: refreshConfidentialState,
    error: confidentialError,
  } = useConfidential(wallet);

  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedTongo, setCopiedTongo] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState<WithdrawToken | null>(null);
  const [withdrawAddr, setWithdrawAddr] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Confidential operations state
  const [isRollingOver, setIsRollingOver] = useState(false);
  const [isConfWithdrawing, setIsConfWithdrawing] = useState(false);
  const [confTxHash, setConfTxHash] = useState<string | null>(null);
  const [confError, setConfError] = useState<string | null>(null);
  const confidentialInitRef = useRef(false);

  // Auto-initialize confidential account when dashboard loads with a deployed wallet
  useEffect(() => {
    if (!wallet || !isDeployed || !authenticated || confidentialInitRef.current) return;
    confidentialInitRef.current = true;

    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      const inst = await initConfidential(token);
      if (inst && address) {
        // Store recipientId so tippers can look it up
        const rid = inst.recipientId;
        await fetch("/api/tongo-recipient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address,
            recipient: { x: String(rid.x), y: String(rid.y) },
          }),
        });
        // Fetch initial state
        try {
          await refreshConfidentialState();
        } catch {
          // state fetch may fail if account has no activity yet — that's fine
        }
      }
    })();
  }, [wallet, isDeployed, authenticated, address, getAccessToken, initConfidential, refreshConfidentialState]);

  const handleRollover = async () => {
    if (!confidential || !wallet || !address) return;
    setIsRollingOver(true);
    setConfError(null);
    try {
      const tx = await wallet.tx()
        .add(...await confidential.rollover({ sender: address as Address }))
        .send();
      await tx.wait();
      await refreshConfidentialState();
    } catch (err) {
      console.error("[Dashboard] rollover error:", err);
      setConfError(err instanceof Error ? err.message : "Rollover failed");
    } finally {
      setIsRollingOver(false);
    }
  };

  const handleConfRagequit = async () => {
    if (!confidential || !wallet || !address) return;
    setIsConfWithdrawing(true);
    setConfError(null);
    setConfTxHash(null);
    try {
      const tx = await wallet.tx()
        .add(...await confidential.ragequit({
          to: address as Address,
          sender: address as Address,
        }))
        .send();
      setConfTxHash(tx.hash);
      await tx.wait();
      await refreshConfidentialState();
    } catch (err) {
      console.error("[Dashboard] ragequit error:", err);
      setConfError(err instanceof Error ? err.message : "Ragequit failed");
    } finally {
      setIsConfWithdrawing(false);
    }
  };

  const tipUrl = address ? `${TIP_BASE_URL}${address}` : "";
  const embedCode = address
    ? `<script src="https://zaptip.vercel.app/widget.js" data-creator="${address}"></script>`
    : "";

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 1500);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `Send me a crypto tip on ZapTip! Built on Starknet.\n\n${tipUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleWithdraw = () => {
    if (!withdrawModal || !withdrawAddr || !withdrawAmount) return;
    withdraw(withdrawModal, withdrawAmount, withdrawAddr);
  };

  const closeModal = () => {
    setWithdrawModal(null);
    setWithdrawAddr("");
    setWithdrawAmount("");
    resetWithdraw();
  };

  const getBalance = (token: WithdrawToken): AmountType | null => balances[token];

  // Not authenticated
  if (!authenticated) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-sm">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center space-y-4">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Creator Dashboard
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to manage your tips and share your tip page
                </p>
              </div>
              <Button size="lg" className="w-full h-11" onClick={login}>
                Sign In
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Authenticated but no wallet
  if (!wallet) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center bg-background p-4">
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
                  Set up your Starknet wallet to view your dashboard
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
        </main>
      </>
    );
  }

  // Wallet connected but not deployed
  if (!isDeployed) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center bg-background p-4">
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
                  Your wallet needs to be deployed first. Fund it with STRK, then deploy.
                </p>
              </div>
              {address && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {truncAddr(address)}
                  </span>
                  <button
                    onClick={() => copyText(address, setCopiedAddr)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedAddr ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              )}
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
        </main>
      </>
    );
  }

  // Full dashboard
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center bg-background p-4 pt-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Logged-in user info */}
          {user?.email && (
            <p className="text-center text-xs text-muted-foreground">
              Signed in as {user.email.address}
            </p>
          )}

          {/* Your Tip Page */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-card-foreground">
              Your Tip Page
            </h2>

            {/* Wallet address */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Wallet Address
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-mono text-muted-foreground truncate flex-1">
                  {address}
                </span>
                <button
                  onClick={() => copyText(address!, setCopiedAddr)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedAddr ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Embed Code */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Embed Code
              </label>
              <div className="flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Code2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <code className="text-xs font-mono text-muted-foreground break-all flex-1">
                  {embedCode}
                </code>
                <button
                  onClick={() => copyText(embedCode, setCopiedEmbed)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                >
                  {copiedEmbed ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Tip URL */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tip Link
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <span className="text-xs font-mono text-muted-foreground truncate flex-1">
                  {tipUrl}
                </span>
                <button
                  onClick={() => copyText(tipUrl, setCopiedUrl)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedUrl ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Share */}
            <Button
              variant="outline"
              className="w-full"
              onClick={shareOnTwitter}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share on Twitter
            </Button>
          </div>

          {/* Balances */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-card-foreground">
                Balances
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => refreshBalances()}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-2">
              {TOKENS.map((token) => {
                const bal = getBalance(token.id);
                const hasBalance = bal && !bal.isZero();
                return (
                  <div
                    key={token.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {token.icon}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {token.label}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {bal ? bal.toFormatted(true) : "0"}
                        </p>
                      </div>
                    </div>
                    {hasBalance && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWithdrawModal(token.id);
                          setWithdrawAddr("");
                          setWithdrawAmount("");
                          resetWithdraw();
                        }}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        Withdraw
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Private Tips */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-card-foreground">
                    Private Tips
                  </h2>
                  {isConfidentialInit ? (
                    <p className="text-sm text-muted-foreground">Setting up...</p>
                  ) : confidential ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                      Active
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {confidentialError || "Not initialized"}
                    </p>
                  )}
                </div>
              </div>
              {confidential && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => refreshConfidentialState()}
                  disabled={isConfidentialLoading}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isConfidentialLoading ? "animate-spin" : ""}`} />
                </Button>
              )}
            </div>

            {/* Tongo address */}
            {tongoAddress && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tongo Address
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-mono text-muted-foreground truncate flex-1">
                    {tongoAddress}
                  </span>
                  <button
                    onClick={() => copyText(tongoAddress, setCopiedTongo)}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedTongo ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Confidential balances */}
            {confidential && confidentialState && (
              <div className="space-y-2">
                {/* Active balance */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Balance</p>
                    <p className="text-sm font-medium text-card-foreground font-mono">
                      {confidentialState.balance.toString()} tongo
                    </p>
                  </div>
                </div>

                {/* Pending balance */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Balance</p>
                    <p className="text-sm font-medium text-card-foreground font-mono">
                      {confidentialState.pending.toString()} tongo
                    </p>
                  </div>
                  {confidentialState.pending > 0n && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRollover}
                      disabled={isRollingOver}
                    >
                      {isRollingOver ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="h-3.5 w-3.5" />
                          Activate
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Withdraw all — uses ragequit to exit entire balance */}
                {(confidentialState.balance > 0n || confidentialState.pending > 0n) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleConfRagequit}
                    disabled={isConfWithdrawing}
                  >
                    {isConfWithdrawing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {confTxHash ? "Confirming..." : "Withdrawing..."}
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        Withdraw All Private Tips
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {confError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{confError}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground pb-4">
            Powered by ZapTip on Starknet
          </p>
        </div>
      </main>

      {/* Withdraw Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4">
            {/* Success */}
            {txHash && !isWithdrawing ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Withdrawal Sent!
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {withdrawAmount} {withdrawModal} sent
                  </p>
                </div>
                <a
                  href={`${EXPLORER_BASE}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  View on Voyager
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    closeModal();
                    refreshBalances();
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Withdraw {withdrawModal}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Balance:{" "}
                    {getBalance(withdrawModal)?.toFormatted(true) || "0"}{" "}
                    {withdrawModal}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recipient Address
                    </label>
                    <Input
                      placeholder="0x..."
                      value={withdrawAddr}
                      onChange={(e) => setWithdrawAddr(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>

                {withdrawError && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{withdrawError}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={closeModal}
                    disabled={isWithdrawing}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleWithdraw}
                    disabled={
                      isWithdrawing ||
                      !withdrawAddr ||
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) <= 0
                    }
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {txHash ? "Confirming..." : "Sending..."}
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confidential ragequit success toast */}
      {confTxHash && !isConfWithdrawing && (
        <div className="fixed bottom-4 right-4 z-50 w-80 rounded-2xl border border-border bg-card p-4 shadow-lg space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm font-medium text-card-foreground">Private Tips Withdrawn!</p>
          </div>
          <a
            href={`${EXPLORER_BASE}${confTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View on Voyager <ExternalLink className="h-3 w-3" />
          </a>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => { setConfTxHash(null); refreshConfidentialState(); }}
          >
            Dismiss
          </Button>
        </div>
      )}
    </>
  );
}
