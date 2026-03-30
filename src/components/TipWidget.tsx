"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTip, type TipToken } from "@/hooks/useTip";
import type { WalletInterface } from "starkzap";
import type { Amount } from "starkzap";
import {
  Zap,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";

interface TipWidgetProps {
  creatorAddress: string;
  creatorName?: string;
  wallet: WalletInterface | null;
  balances: { STRK: Amount | null; ETH: Amount | null; USDC: Amount | null };
  onRefreshBalances: () => void;
}

const TOKENS: { id: TipToken; label: string; icon: string }[] = [
  { id: "STRK", label: "STRK", icon: "S" },
  { id: "ETH", label: "ETH", icon: "E" },
  { id: "USDC", label: "USDC", icon: "$" },
];

const PRESETS = ["1", "3", "5", "10"];

function truncateAddress(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const EXPLORER_BASE = "https://voyager.online/tx/";

export default function TipWidget({
  creatorAddress,
  creatorName,
  wallet,
  balances,
  onRefreshBalances,
}: TipWidgetProps) {
  const [selectedToken, setSelectedToken] = useState<TipToken>("STRK");
  const [amount, setAmount] = useState("1");
  const [isPrivate, setIsPrivate] = useState(false);

  const { isLoading, txHash, error, sendTip, reset } = useTip(wallet);

  const handleSend = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    sendTip(selectedToken, amount, creatorAddress);
  };

  const handlePreset = (value: string) => {
    setAmount(value);
  };

  const currentBalance = balances[selectedToken];

  // Success state
  if (txHash && !isLoading) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Tip Sent!
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {amount} {selectedToken} sent to{" "}
                {creatorName || truncateAddress(creatorAddress)}
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
              size="lg"
              className="mt-2 w-full"
              onClick={() => {
                reset();
                onRefreshBalances();
              }}
            >
              Send Another Tip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-card-foreground truncate">
                  {creatorName ? `Tip ${creatorName}` : "Send a Tip"}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {truncateAddress(creatorAddress)}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Token selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Token
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TOKENS.map((token) => (
                <button
                  key={token.id}
                  onClick={() => setSelectedToken(token.id)}
                  className={`
                    flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5
                    text-sm font-medium transition-all
                    ${
                      selectedToken === token.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }
                  `}
                >
                  <span className="text-xs font-bold opacity-60">
                    {token.icon}
                  </span>
                  {token.label}
                </button>
              ))}
            </div>
            {currentBalance && (
              <p className="text-xs text-muted-foreground">
                Balance: {currentBalance.toFormatted(true)}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePreset(preset)}
                  className={`
                    rounded-lg border px-2 py-2 text-sm font-medium transition-all
                    ${
                      amount === preset
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }
                  `}
                >
                  {preset}
                </button>
              ))}
            </div>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Private tip toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  Tip Privately
                </p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Send button */}
          <Button
            size="lg"
            className="w-full h-11 text-base font-semibold"
            onClick={handleSend}
            disabled={isLoading || !wallet || !amount || parseFloat(amount) <= 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {txHash ? "Confirming..." : "Sending..."}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Send {amount || "0"} {selectedToken}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
