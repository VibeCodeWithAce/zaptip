"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  UserPlus,
  Share2,
  Coins,
  Code2,
  Wallet,
  ArrowLeftRight,
  Shield,
  KeyRound,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const STEPS = [
  {
    icon: UserPlus,
    title: "Sign up & get your tip page",
    desc: "Login with Google, Twitter, or email. A Starknet wallet is created for you automatically.",
  },
  {
    icon: Share2,
    title: "Embed or share your link",
    desc: "Add a one-line script to any website, or copy your unique tip URL to share anywhere.",
  },
  {
    icon: Coins,
    title: "Receive tips in STRK, ETH, or USDC",
    desc: "Supporters send tips from their browser. Withdraw anytime from your dashboard.",
  },
];

const MODULES = [
  {
    icon: KeyRound,
    label: "Privy Auth",
    desc: "Social login with server-managed Starknet wallets",
  },
  {
    icon: Wallet,
    label: "Smart Wallets",
    desc: "OpenZeppelin account abstraction with auto-deploy",
  },
  {
    icon: ArrowLeftRight,
    label: "ERC-20 Transfers",
    desc: "Multi-token transfers via Starkzap SDK",
  },
  {
    icon: Shield,
    label: "Tx Builder",
    desc: "Composable transaction execution on Starknet",
  },
  {
    icon: Sparkles,
    label: "AVNU Paymaster",
    desc: "Gasless wallet deploys and withdrawals",
  },
];

const EMBED_SNIPPET = `<script\n  src="https://zaptip.vercel.app/widget.js"\n  data-creator="YOUR_WALLET_ADDRESS"\n></script>`;

export default function Home() {
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const copyEmbed = () => {
    navigator.clipboard.writeText(EMBED_SNIPPET);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 1500);
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 pt-24 pb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Built on Starknet with Starkzap SDK
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Accept crypto tips{" "}
              <br className="hidden sm:block" />
              on any website
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Private. Simple. One line of code.{" "}
              <br className="hidden sm:block" />
              Let anyone tip you in STRK, ETH, or USDC on Starknet.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/blog/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-base font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Try the Demo
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-4xl px-4 py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground">
                How it works
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Three steps to start accepting crypto tips
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Embed Code */}
        <section className="mx-auto max-w-4xl px-4 py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">
              One line to embed
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a floating tip button to any website
            </p>
          </div>
          <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-1">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">HTML</span>
              </div>
              <button
                onClick={copyEmbed}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedEmbed ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 text-sm font-mono text-muted-foreground">
              <code>{EMBED_SNIPPET}</code>
            </pre>
          </div>
        </section>

        {/* Built With */}
        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-4xl px-4 py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground">
                Built with Starkzap SDK
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Deep integration with core Starkzap modules
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {MODULES.map((mod) => (
                <div
                  key={mod.label}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <mod.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground">
                      {mod.label}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {mod.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">ZapTip</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Starkzap for the Starkzap Developer Challenge
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Network: Starknet
          </p>
        </footer>
      </main>
    </>
  );
}
