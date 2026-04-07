"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTip, type TipToken } from "@/hooks/useTip";
import { useConfidential } from "@/hooks/useConfidential";
import {
  Amount,
  type Address,
  type ConfidentialRecipient,
  mainnetTokens,
} from "starkzap";
import type { WalletInterface } from "starkzap";
import type { Amount as AmountType } from "starkzap";
import {
  Zap,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Lock,
  Copy,
  Check,
} from "lucide-react";

interface TipWidgetProps {
  creatorAddress: string;
  creatorName?: string;
  wallet: WalletInterface | null;
  balances: { STRK: AmountType | null; ETH: AmountType | null; USDC: AmountType | null };
  onRefreshBalances: () => void;
}

const TOKENS: { id: TipToken; label: string; icon: string }[] = [
  { id: "STRK", label: "STRK", icon: "S" },
  { id: "ETH", label: "ETH", icon: "E" },
  { id: "USDC", label: "USDC", icon: "$" },
];

// The token supported by the Tongo contract. We'll determine this dynamically
// but default to STRK. Update this if the contract uses a different token.
const CONFIDENTIAL_TOKEN: TipToken = "STRK";

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

  const [copiedAddr, setCopiedAddr] = useState(false);
  const { isLoading, txHash, error, sendTip, reset } = useTip(wallet);
  const { getAccessToken } = usePrivy();

  // Confidential tipping state
  const {
    confidential,
    initialize: initConfidential,
    error: confInitError,
    isInitializing: isConfInit,
  } = useConfidential(wallet);

  const [creatorRecipient, setCreatorRecipient] = useState<ConfidentialRecipient | null>(null);
  const [creatorRecipientLoading, setCreatorRecipientLoading] = useState(true);
  const [isPrivateSending, setIsPrivateSending] = useState(false);
  const [privateTxHash, setPrivateTxHash] = useState<string | null>(null);
  const [privateError, setPrivateError] = useState<string | null>(null);
  const confInitStarted = useRef(false);

  // Fetch creator's Tongo recipientId on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/tongo-recipient?address=${creatorAddress}`);
        const data = await res.json();
        if (data.recipient) {
          setCreatorRecipient(data.recipient);
        }
      } catch {
        // Creator hasn't set up private tips
      } finally {
        setCreatorRecipientLoading(false);
      }
    })();
  }, [creatorAddress]);

  // Whether private tipping is available for the selected token
  const canTipPrivately = creatorRecipient !== null && selectedToken === CONFIDENTIAL_TOKEN;

  // If user toggles private on but switches to unsupported token, turn it off
  useEffect(() => {
    if (isPrivate && selectedToken !== CONFIDENTIAL_TOKEN) {
      setIsPrivate(false);
    }
  }, [selectedToken, isPrivate]);

  const handleSend = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    if (isPrivate && canTipPrivately) {
      await handlePrivateSend();
    } else {
      sendTip(selectedToken, amount, creatorAddress);
    }
  };

  const handlePrivateSend = async () => {
    if (!wallet || !creatorRecipient) return;

    setIsPrivateSending(true);
    setPrivateError(null);
    setPrivateTxHash(null);

    try {
      // Initialize confidential instance if needed
      let conf = confidential;
      if (!conf) {
        if (confInitStarted.current) {
          throw new Error("Confidential initialization in progress, please wait");
        }
        confInitStarted.current = true;
        const token = await getAccessToken();
        if (!token) throw new Error("Failed to get access token");
        conf = await initConfidential(token);
        if (!conf) throw new Error(confInitError || "Failed to initialize confidential account");
      }

      const parsedAmount = Amount.parse(amount, mainnetTokens[CONFIDENTIAL_TOKEN]);
      // Convert ERC20 amount to tongo units (accounts for the on-chain rate)
      const tongoUnits = await conf.toConfidentialUnits(parsedAmount);
      const tongoAmount = Amount.fromRaw(tongoUnits, mainnetTokens[CONFIDENTIAL_TOKEN]);
      const senderAddress = wallet.address.toString() as Address;

      // Step 1: Fund the tipper's confidential account (includes ERC20 approve)
      // Must be a separate tx because the transfer ZK proof reads on-chain
      // state — the balance must reflect the fund before we can prove the transfer.
      const fundTx = await wallet
        .tx()
        .confidentialFund(conf, {
          amount: tongoAmount,
          sender: senderAddress,
        })
        .send({ feeMode: "user_pays" });

      setPrivateTxHash(fundTx.hash);
      await fundTx.wait();

      // Step 2: Transfer from tipper's confidential account to creator
      // Now the on-chain balance includes the funded amount, so the proof succeeds.
      const transferTx = await wallet
        .tx()
        .confidentialTransfer(conf, {
          amount: tongoAmount,
          to: creatorRecipient,
          sender: senderAddress,
        })
        .send({ feeMode: "user_pays" });

      setPrivateTxHash(transferTx.hash);
      await transferTx.wait();
      setIsPrivateSending(false);
    } catch (err) {
      console.error("[TipWidget] private tip error:", err);
      setPrivateError(err instanceof Error ? err.message : "Private tip failed");
      setIsPrivateSending(false);
    }
  };

  const handlePreset = (value: string) => {
    setAmount(value);
  };

  const currentBalance = balances[selectedToken];

  const effectiveLoading = isPrivate ? isPrivateSending : isLoading;
  const effectiveTxHash = isPrivate ? privateTxHash : txHash;
  const effectiveError = isPrivate ? privateError : error;

  // Success state
  if (effectiveTxHash && !effectiveLoading) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {isPrivate ? "Private Tip Sent!" : "Tip Sent!"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {amount} {selectedToken} sent to{" "}
                {creatorName || truncateAddress(creatorAddress)}
                {isPrivate && " (confidentially)"}
              </p>
            </div>
            <a
              href={`${EXPLORER_BASE}${effectiveTxHash}`}
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
                setPrivateTxHash(null);
                setPrivateError(null);
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
          {/* Tipper wallet address */}
          {wallet && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Your wallet
              </span>
              <span className="text-xs font-mono text-muted-foreground truncate">
                {truncateAddress(wallet.address.toString())}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(wallet.address.toString());
                  setCopiedAddr(true);
                  setTimeout(() => setCopiedAddr(false), 1500);
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedAddr ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          )}

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
                {creatorRecipientLoading ? (
                  <p className="text-xs text-muted-foreground">Checking availability...</p>
                ) : !creatorRecipient ? (
                  <p className="text-xs text-muted-foreground">Creator hasn&apos;t enabled private tips</p>
                ) : selectedToken !== CONFIDENTIAL_TOKEN ? (
                  <p className="text-xs text-muted-foreground">
                    Private tips only available with {CONFIDENTIAL_TOKEN}
                  </p>
                ) : isConfInit ? (
                  <p className="text-xs text-muted-foreground">Initializing...</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Send via Tongo confidential transfer
                  </p>
                )}
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={!canTipPrivately || creatorRecipientLoading}
            />
          </div>

          {/* Error */}
          {effectiveError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{effectiveError}</p>
            </div>
          )}

          {/* Send button */}
          <Button
            size="lg"
            className="w-full h-11 text-base font-semibold"
            onClick={handleSend}
            disabled={effectiveLoading || !wallet || !amount || parseFloat(amount) <= 0}
          >
            {effectiveLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {effectiveTxHash ? "Confirming..." : isPrivate ? "Preparing proof..." : "Sending..."}
              </>
            ) : (
              <>
                {isPrivate ? <Lock className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                {isPrivate ? "Send Privately" : "Send"} {amount || "0"} {selectedToken}
              </>
            )}
          </Button>

          {/* Watermark */}
          <p className="text-center text-xs text-muted-foreground/60" style={{ fontSize: 12 }}>
            <Zap className="inline h-3 w-3 -mt-px mr-0.5" />
            Powered by ZapTip
          </p>
        </div>
      </div>
    </div>
  );
}
