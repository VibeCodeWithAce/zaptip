"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    const children = el.querySelectorAll("[data-fade]");
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}

const FEATURES = [
  {
    title: "Social Login Wallets",
    desc: "Google, email, passkeys \u2014 no seed phrases, no browser extensions. Users sign in the way they already know.",
  },
  {
    title: "Gasless Transactions",
    desc: "Fees are abstracted away entirely. Users interact without ever thinking about gas.",
  },
  {
    title: "Built-in DeFi Primitives",
    desc: "Staking, ERC-20 transfers, composable transaction batching \u2014 all through one clean API.",
  },
  {
    title: "Cross-Platform",
    desc: "Web, mobile, and server environments. Same SDK, same patterns, everywhere.",
  },
];

export default function BlogDemoPage() {
  const fadeRef = useFadeIn();

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap");
        .blog-serif {
          font-family: "Playfair Display", Georgia, "Times New Roman", serif;
        }
        .blog-sans {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }
        [data-fade] {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
      `}</style>

      <div ref={fadeRef} className="min-h-screen bg-[#0a0a0a] text-[#d4d0c8] selection:bg-amber-500/20 selection:text-amber-200">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-white/[0.04]">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <span className="blog-serif text-lg font-semibold text-white/90 tracking-tight">
              Knightt&rsquo;s Corner
            </span>
            <div className="blog-sans flex items-center gap-6 text-xs text-white/30 tracking-wide">
              <span className="hover:text-white/60 transition-colors cursor-pointer">Home</span>
              <span className="text-white/10">&middot;</span>
              <span className="hover:text-white/60 transition-colors cursor-pointer">Archive</span>
              <span className="text-white/10">&middot;</span>
              <span className="hover:text-white/60 transition-colors cursor-pointer">About</span>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative pt-16">
          <div className="relative h-[70vh] min-h-[480px] max-h-[640px] overflow-hidden">
            {/* Hero image */}
            <div className="absolute inset-0">
              <img
                src="/blog-hero.png"
                alt=""
                className="h-full w-full object-cover"
              />
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 to-transparent" />
            </div>

            {/* Hero text */}
            <div className="relative h-full flex flex-col justify-end pb-14 px-6">
              <div className="mx-auto w-full max-w-3xl">
                <div className="blog-sans flex items-center gap-3 mb-5">
                  <span className="inline-block h-px w-8 bg-amber-500/60" />
                  <time className="text-xs tracking-widest uppercase text-amber-500/70">
                    March 29, 2026
                  </time>
                  <span className="text-white/15">&middot;</span>
                  <span className="text-xs tracking-widest uppercase text-white/30">
                    4 min read
                  </span>
                </div>
                <h1 className="blog-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-white">
                  Day 230 of Exploring
                  <br />
                  Starknet
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Article */}
        <main className="mx-auto max-w-[680px] px-6 pt-16 pb-8">
          {/* Author bar */}
          <div data-fade className="flex items-center gap-4 mb-14 pb-10 border-b border-white/[0.06]">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 ring-2 ring-white/[0.06]" />
            <div>
              <p className="blog-sans text-sm font-medium text-white/80">
                Knightt
              </p>
              <p className="blog-sans text-xs text-white/25">
                Builder &middot; Starknet explorer &middot; Day 230
              </p>
            </div>
          </div>

          {/* Body */}
          <article className="blog-serif text-[1.125rem] leading-[1.85] text-[#d4d0c8]/70">
            <p data-fade>
              Today we&rsquo;re talking about{" "}
              <strong className="text-white/90 font-semibold">Starkzap</strong>{" "}
              &mdash; a new developer toolkit built on Starknet that makes it
              ridiculously easy to add crypto features into any app.
            </p>

            <p data-fade className="mt-7">
              Instead of spending months building wallets, handling gas fees,
              and stitching together protocols, Starkzap compresses all of that
              into a single SDK. You plug it in and start shipping.
            </p>

            {/* Block quote */}
            <blockquote
              data-fade
              className="my-12 relative pl-7 border-l-[3px] border-amber-500/50"
            >
              <p className="blog-serif text-xl italic leading-relaxed text-white/50">
                &ldquo;Starkzap turns <em>maybe we&rsquo;ll add crypto
                later</em> into <em>we shipped it today.</em>&rdquo;
              </p>
            </blockquote>

            {/* Feature cards */}
            <div data-fade className="my-12">
              <h2 className="blog-sans text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/60 mb-6">
                What makes it interesting
              </h2>
              <div className="grid gap-3">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 transition-colors hover:bg-white/[0.04]"
                  >
                    <h3 className="blog-sans text-sm font-semibold text-white/80 mb-1.5">
                      {f.title}
                    </h3>
                    <p className="blog-sans text-sm leading-relaxed text-white/35">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p data-fade className="mt-7">
              The real idea is simple: most apps want crypto but don&rsquo;t
              ship it because the complexity is too high. Starkzap removes that
              friction so builders can focus on product, not infrastructure.
            </p>

            <p data-fade className="mt-7">
              Account abstraction on Starknet makes this possible at the
              protocol level, but Starkzap is the layer that makes it{" "}
              <em className="text-white/50">accessible</em>. There&rsquo;s a
              real difference between &ldquo;the chain supports it&rdquo; and
              &ldquo;a developer can ship it this afternoon.&rdquo;
            </p>

            <p data-fade className="mt-7">
              I&rsquo;ll keep exploring and writing about what I find. If
              you&rsquo;re building on Starknet or thinking about it, this is
              worth watching.
            </p>

            <p data-fade className="mt-10 blog-sans text-sm text-white/25">
              &mdash; Knightt
            </p>
          </article>

          {/* Tip section */}
          <div data-fade className="mt-20">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <div className="pt-12 pb-4 text-center">
              <p className="blog-sans text-xs uppercase tracking-[0.2em] text-white/25 mb-3">
                Support the author
              </p>
              <p className="blog-serif text-2xl font-semibold text-white/90">
                Enjoyed this post?
              </p>
              <p className="blog-sans text-sm text-white/30 mt-3 max-w-sm mx-auto leading-relaxed">
                If this was useful, consider sending a small tip. It goes
                directly to the writer&rsquo;s wallet on Starknet.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/[0.04] py-10 text-center">
          <p className="blog-sans text-xs text-white/15 tracking-wide">
            &copy; 2026 Knightt&rsquo;s Corner
          </p>
        </footer>
      </div>

      {/* ZapTip widget */}
      <Script
        src="https://zaptip.vercel.app/widget.js"
        data-creator="0x0198c3fcfd8a6d2ddd057c49c70ea813163587689a4938d5be4e26cc441413be"
        strategy="lazyOnload"
      />
    </>
  );
}
