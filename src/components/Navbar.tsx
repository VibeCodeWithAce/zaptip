"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Zap, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { authenticated, logout } = usePrivy();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1.5">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-base font-bold tracking-tight text-foreground">
              ZapTip
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className={`text-sm transition-colors ${
                pathname === "/"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm transition-colors ${
                pathname === "/dashboard"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>
        {authenticated && (
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
