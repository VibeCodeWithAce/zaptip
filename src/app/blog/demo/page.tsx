import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Day 230 of Exploring Starknet | Knightt's Corner",
  description:
    "Starkzap compresses months of blockchain integration into a single SDK you can ship in minutes.",
};

export default function BlogDemoPage() {
  return (
    <>
      <div className="min-h-screen bg-[#0c0c0e] text-[#e0ddd5] selection:bg-amber-500/20 selection:text-amber-200">
        {/* Nav */}
        <header className="border-b border-white/[0.06]">
          <div className="mx-auto max-w-2xl px-6 py-5 flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wide text-[#e0ddd5]/90">
              Knightt&rsquo;s Corner
            </span>
            <span className="text-xs text-[#e0ddd5]/30 tracking-wider uppercase">
              Blog
            </span>
          </div>
        </header>

        {/* Article */}
        <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
          {/* Meta */}
          <div className="mb-10 space-y-4">
            <time className="text-xs tracking-wider uppercase text-[#e0ddd5]/30">
              March 28, 2026
            </time>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white">
              Day 230 of Exploring Starknet
            </h1>
            <div className="flex items-center gap-3 pt-1">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600" />
              <div>
                <p className="text-sm font-medium text-[#e0ddd5]/80">
                  Knightt
                </p>
                <p className="text-xs text-[#e0ddd5]/30">8 min read</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <article className="space-y-6 text-base leading-relaxed text-[#e0ddd5]/70">
            <p>
              Today I want to talk about something I&rsquo;ve been digging into
              lately &mdash;{" "}
              <strong className="text-[#e0ddd5]/90 font-semibold">
                Starkzap
              </strong>
              , a developer toolkit built on Starknet that makes it genuinely
              easy to add crypto features to any application without drowning in
              blockchain complexity.
            </p>

            <p>
              If you&rsquo;ve ever tried to integrate wallets, handle gas fees,
              stitch together protocols, and ship something production-ready,
              you know that process can eat months. Starkzap compresses all of
              that into a single SDK you can plug in and start using in minutes.
            </p>

            <blockquote className="border-l-2 border-amber-500/40 pl-5 my-8 text-[#e0ddd5]/50 italic">
              &ldquo;Most apps want to integrate crypto but never ship it
              because the complexity is too high. Starkzap removes that
              friction so builders can focus on product, not
              infrastructure.&rdquo;
            </blockquote>

            <p>
              The mental model is simple: you&rsquo;re building a normal web or
              mobile app, but now you can bolt on Bitcoin, stablecoins, DeFi
              primitives, even on-chain gaming &mdash; without rebuilding your
              stack from the ground up.
            </p>

            <h2 className="text-xl font-semibold text-white pt-4">
              What makes it interesting
            </h2>

            <ul className="space-y-3 pl-1">
              {[
                [
                  "Social login wallets",
                  "Google, email, passkeys \u2014 no seed phrases, no extensions. Users sign in the way they already know how.",
                ],
                [
                  "Gasless transactions",
                  "Fees are abstracted away. Users interact without ever thinking about gas.",
                ],
                [
                  "Built-in DeFi tools",
                  "Staking, ERC-20 transfers, composable transaction batching \u2014 all through a clean API.",
                ],
                [
                  "Cross-platform",
                  "Web, mobile, and server environments. Same SDK, same patterns.",
                ],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60" />
                  <div>
                    <span className="font-medium text-[#e0ddd5]/90">
                      {title}.
                    </span>{" "}
                    <span>{desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-white pt-4">
              The bigger picture
            </h2>

            <p>
              The crypto industry has a shipping problem. Teams spend so long
              on infrastructure that the product never reaches users. Starkzap
              flips that &mdash; you start with the product and layer in crypto
              capabilities as you need them.
            </p>

            <p>
              Account abstraction on Starknet makes this possible at the
              protocol level, but Starkzap is the layer that makes it
              <em> accessible</em>. There&rsquo;s a meaningful difference
              between &ldquo;the chain supports it&rdquo; and &ldquo;a
              developer can ship it this afternoon.&rdquo;
            </p>

            <blockquote className="border-l-2 border-amber-500/40 pl-5 my-8 text-[#e0ddd5]/50 italic">
              Starkzap turns &ldquo;maybe we&rsquo;ll add crypto later&rdquo;
              into &ldquo;we shipped it today.&rdquo;
            </blockquote>

            <p>
              I&rsquo;ll keep exploring and writing about what I find. If
              you&rsquo;re building on Starknet or thinking about it, this is
              worth watching.
            </p>

            <p className="text-[#e0ddd5]/40 text-sm pt-4">&mdash; Knightt</p>
          </article>

          {/* Tip section */}
          <div className="mt-20 pt-10 border-t border-white/[0.06]">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-[#e0ddd5]/60">
                Enjoyed this post?
              </p>
              <p className="text-lg font-semibold text-white">
                Tip the author
              </p>
              <p className="text-xs text-[#e0ddd5]/30 max-w-xs mx-auto leading-relaxed">
                If this was useful, consider sending a small tip. It goes
                directly to the author&rsquo;s wallet on Starknet.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] py-8 text-center">
          <p className="text-xs text-[#e0ddd5]/20">
            Knightt&rsquo;s Corner &middot; 2026
          </p>
        </footer>
      </div>

      {/* ZapTip widget */}
      <Script
        src="https://zaptip.vercel.app/widget.js"
        data-creator="0x0589e592a39bb6961d7e4aed7a8b861903ce6868373331617728a79ff5f941f6"
        strategy="lazyOnload"
      />
    </>
  );
}
