import { NextRequest, NextResponse } from "next/server";
import { getPrivyClient } from "@/lib/privy-server";

interface WalletMapping {
  id: string;
  publicKey: string;
}

// In-memory cache — maps Privy userId to their server wallet.
// Server wallets have no owner, so this cache is the only user→wallet link.
// On cold starts or new instances, a new wallet will be created.
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
      // Create a server wallet (no owner) for this user
      console.log("[signer-context] creating server wallet for", userId);
      const wallet = await privy.wallets().create({
        chain_type: "starknet",
      });
      walletInfo = {
        id: wallet.id,
        publicKey: wallet.public_key!,
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
