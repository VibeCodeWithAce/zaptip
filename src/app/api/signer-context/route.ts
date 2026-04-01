import { NextRequest, NextResponse } from "next/server";
import { getPrivyClient } from "@/lib/privy-server";
import { redis } from "@/lib/redis";

interface WalletMapping {
  id: string;
  publicKey: string;
}

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

    // Check Redis for an existing wallet mapping
    const existing = await redis.get<WalletMapping>(`wallet:${userId}`);

    let walletInfo: WalletMapping;

    if (existing) {
      console.log("[signer-context] Found existing wallet for user:", userId, existing.id);
      walletInfo = existing;
    } else {
      // Create a server wallet (no owner) for this user
      console.log("[signer-context] creating server wallet for", userId);
      const wallet = await privy.wallets().create({
        chain_type: "starknet",
      });
      walletInfo = {
        id: wallet.id,
        publicKey: wallet.public_key!,
      };
      await redis.set(`wallet:${userId}`, walletInfo);
      console.log("[signer-context] Created new wallet for user:", userId, wallet.id);
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
