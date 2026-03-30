import { NextRequest, NextResponse } from "next/server";
import { getPrivyClient } from "@/lib/privy-server";

interface WalletMapping {
  id: string;
  publicKey: string;
}

// In-memory cache — survives within a single serverless instance lifetime.
// On cold starts, wallets are re-fetched from Privy by user_id.
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
    const privy = getPrivyClient();

    // Verify the JWT and extract the unique Privy user ID
    const claims = await privy.utils().auth().verifyAccessToken(accessToken);
    const userId = claims.user_id;

    console.log("[signer-context] verified userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token: no user_id" },
        { status: 401 }
      );
    }

    let walletInfo = walletCache.get(userId);

    if (!walletInfo) {
      // Check if this user already has a Starknet wallet in Privy
      let existingWallet = null;
      for await (const w of privy.wallets().list({
        user_id: userId,
        chain_type: "starknet",
      })) {
        existingWallet = w;
        break; // take the first one
      }

      if (existingWallet) {
        console.log("[signer-context] found existing wallet for", userId, "walletId:", existingWallet.id);
        walletInfo = {
          id: existingWallet.id,
          publicKey: existingWallet.public_key!,
        };
      } else {
        // Create a new Starknet wallet linked to this user
        console.log("[signer-context] creating new wallet for", userId);
        const wallet = await privy.wallets().create({
          chain_type: "starknet",
          owner: { user_id: userId },
        });
        walletInfo = {
          id: wallet.id,
          publicKey: wallet.public_key!,
        };
      }

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
