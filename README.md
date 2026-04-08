# ZapTip

Embeddable crypto tipping widget built with Starkzap SDK for the Starkzap Developer Challenge.

**Live:** https://zaptip.vercel.app

**Demo:** https://zaptip.vercel.app/blog/demo

## What is ZapTip?

ZapTip lets anyone accept crypto tips on any website with a single line of code. Creators sign up with Google, Twitter, or email — a Starknet wallet is created automatically — and get a unique tip page they can share or embed. Supporters send tips in STRK, ETH, or USDC directly from their browser.

<!-- ![ZapTip Screenshot](screenshot.png) -->

## Features

- **Social Login** — Sign in with Google, Twitter, or email via Privy. No crypto wallet required.
- **Multi-Token Tips** — Accept tips in STRK, ETH, and USDC on Starknet.
- **Private Tipping** — Send confidential tips via Tongo. The amount and sender are hidden on-chain.
- **Creator Dashboard** — View balances, manage private tips, copy your tip link, share on Twitter, withdraw funds.
- **Embeddable Widget** — Add a floating "Tip me" button to any website with one `<script>` tag.
- **Withdraw Flow** — Transfer tokens to any external Starknet address from the dashboard.
- **Embed Mode** — Clean iframe-friendly tip page for widget integration.

## Starkzap Modules Used

| Module | Usage |
|--------|-------|
| **Privy Integration** | Social login + server-managed Starknet wallets via `OnboardStrategy.Privy` |
| **Wallets** | OpenZeppelin account abstraction with `wallet.ensureReady()` auto-deploy |
| **ERC-20 Transfers** | Multi-token transfers via `wallet.transfer()` with `mainnetTokens` |
| **Tx Builder** | Composable transaction batching for tips, withdrawals, and confidential operations |
| **AVNU Paymaster** | Gasless wallet deployment |
| **[Tongo Confidential Transfers](https://docs.starknet.io/build/starkzap/confidential)** | Private tipping via `TongoConfidential` — fund, transfer, rollover, and ragequit |

## Tech Stack

- [Next.js](https://nextjs.org/) — React framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [shadcn/ui](https://ui.shadcn.com/) — UI components (base-nova style)
- [Starkzap SDK](https://www.starkzap.com/) — Starknet wallet management and transactions
- [Privy](https://privy.io/) — Social authentication and wallet creation
- [Upstash Redis](https://upstash.com/) — Persistent user-to-wallet mapping
- [Tongo SDK](https://github.com/fatlabsxyz/tongo) — Confidential ERC-20 transfers on Starknet

## Getting Started

### Prerequisites

- Node.js 18+
- A [Privy](https://dashboard.privy.io/) account with app ID and secret
- An [Upstash Redis](https://console.upstash.com/) database (or Vercel KV)

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/zaptip.git
cd zaptip/zaptip-app
npm install
```

Copy the environment file and fill in your keys:

```bash
cp .env.example .env.local
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Yes | Privy app ID from dashboard.privy.io |
| `PRIVY_APP_SECRET` | Yes | Privy app secret for server-side wallet creation |
| `NEXT_PUBLIC_STARKNET_NETWORK` | Yes | Network name (`mainnet`) |
| `KV_REST_API_URL` | Yes | Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | Yes | Upstash Redis REST token |
| `NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS` | No | Tongo contract address (defaults to mainnet STRK) |
| `NEXT_PUBLIC_APP_URL` | No | Override app URL (auto-detected in dev) |

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
  app/
    page.tsx              — Landing page with live demo
    dashboard/page.tsx    — Creator dashboard (balances, private tips, withdraw)
    tip/[creatorId]/      — Tip page (supports ?embed=true for iframes)
    api/
      signer-context/     — Creates/retrieves Privy Starknet wallets (Redis-backed)
      wallet/sign/        — Signing endpoint for Starkzap SDK
      tongo-key/          — Tongo private key management per user
      tongo-recipient/    — Creator Tongo public key lookup for private tips
  components/
    Navbar.tsx            — Shared navigation bar
    TipWidget.tsx         — Core tipping UI (token select, amount, private toggle, send)
    LandingDemo.tsx       — Landing page embedded demo
  hooks/
    useStarkzap.ts        — SDK init, wallet connection, deploy, balances
    useTip.ts             — Token transfer logic for tipping
    useWithdraw.ts        — Token transfer logic for withdrawals
    useConfidential.ts    — Tongo key management and confidential state
  lib/
    privy-server.ts       — Privy client for server-side operations
    redis.ts              — Upstash Redis client for wallet persistence
    tongo.ts              — Tongo contract address config
public/
  widget.js               — Embeddable script (floating button + iframe)
```

**Flow:** Privy handles social login and creates a server-managed Starknet wallet. The wallet mapping is persisted in Upstash Redis so it survives cold starts and redeploys. The Starkzap SDK onboards the wallet using the OpenZeppelin account preset. Users fund their wallet, deploy it, then send ERC-20 transfers to creator addresses. For private tips, the tipper's STRK is deposited into the Tongo confidential contract and transferred to the creator's confidential account — the amount is hidden on-chain using zero-knowledge proofs.

## Embed Widget

Add this to any website to show a floating "Tip me" button:

```html
<script
  src="https://zaptip.vercel.app/widget.js"
  data-creator="YOUR_WALLET_ADDRESS"
></script>
```

## Future Improvements

- **Database Backend** — Creator profiles, tip history, analytics
- **Vanity URLs** — Custom tip page URLs (e.g., zaptip.vercel.app/tip/@alice)

## License

MIT

---

Built for the **Starkzap Developer Challenge**.
