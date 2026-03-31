import { NextRequest, NextResponse } from "next/server";
import { getPrivyClient } from "@/lib/privy-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletId, hash } = body;

    console.log("[sign] Incoming request:", { walletId, hash: hash?.slice(0, 20) + "..." });

    if (!walletId || !hash) {
      console.log("[sign] Missing fields:", { walletId: !!walletId, hash: !!hash });
      return NextResponse.json(
        { error: "Missing walletId or hash" },
        { status: 400 }
      );
    }

    const authorizationKey = process.env.PRIVY_AUTHORIZATION_KEY;
    if (!authorizationKey) {
      console.error("[sign] PRIVY_AUTHORIZATION_KEY is not set");
      return NextResponse.json(
        { error: "Server misconfiguration: missing wallet authorization key" },
        { status: 500 }
      );
    }

    const privy = getPrivyClient();

    console.log("[sign] Calling privy.wallets().rawSign for wallet:", walletId);

    // Use Privy to sign the hash with the wallet's private key
    const result = await privy.wallets().rawSign(walletId, {
      params: { hash },
      authorization_context: {
        authorization_private_keys: [authorizationKey],
      },
    });

    console.log("[sign] Success, signature length:", result.signature?.length);

    return NextResponse.json({ signature: result.signature });
  } catch (error) {
    console.error("[sign] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
      cause: error instanceof Error ? (error as unknown as Record<string, unknown>).cause : undefined,
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 3).join("\n") : undefined,
    });
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Signing failed: ${message}` },
      { status: 500 }
    );
  }
}
