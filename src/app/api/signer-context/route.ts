import { NextRequest, NextResponse } from "next/server";
import { getPrivyClient } from "@/lib/privy-server";

interface WalletMapping {
  id: string;
  publicKey: string;
}

// In-memory cache — survives within a single serverless instance lifetime.
// On cold starts, wallets are re-fetched/created via Privy.
const walletCache = new Map<string, WalletMapping>();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.slice(7);

    // Decode the JWT payload to get the user ID
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64url").toString()
    );
    const userId = payload.sub as string;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token: no sub claim" },
        { status: 401 }
      );
    }

    const privy = getPrivyClient();

    let walletInfo = walletCache.get(userId);

    if (!walletInfo) {
      // Create a new Starknet wallet for this user via Privy
      const wallet = await privy.wallets().create({
        chain_type: "starknet",
      });

      walletInfo = {
        id: wallet.id,
        publicKey: wallet.public_key,
      };
      walletCache.set(userId, walletInfo);
    }

    // Return wallet info + the URL of our signing endpoint
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    console.log("[signer-context] userId:", userId, "walletId:", walletInfo.id, "publicKey:", walletInfo.publicKey?.slice(0, 20) + "...");

    return NextResponse.json({
      walletId: walletInfo.id,
      publicKey: walletInfo.publicKey,
      serverUrl: `${baseUrl}/api/wallet/sign`,
    });
  } catch (error) {
    console.error("Signer context error:", error);
    return NextResponse.json(
      { error: "Failed to resolve signer context" },
      { status: 500 }
    );
  }
}
