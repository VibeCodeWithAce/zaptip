import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Milestone 1 — Privy server-side verification
  // 1. Verify Privy access token from Authorization header
  // 2. Return { walletId, publicKey, serverUrl } for Starkzap onboarding
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
