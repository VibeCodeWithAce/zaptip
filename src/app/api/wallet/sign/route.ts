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

    const privy = getPrivyClient();

    // Validate the wallet exists and belongs to this app
    const wallet = await privy.wallets().get(walletId);
    if (!wallet) {
      console.error("[sign] Wallet not found:", walletId);
      return NextResponse.json(
        { error: "Wallet not found or not accessible" },
        { status: 404 }
      );
    }
    console.log("[sign] Wallet verified:", { id: wallet.id, ownerId: wallet.owner_id, chain: wallet.chain_type });

    console.log("[sign] Calling privy.wallets().rawSign for wallet:", walletId);

    // Build rawSign options — include authorization key only if configured
    const authorizationKey = process.env.PRIVY_AUTHORIZATION_KEY;
    const rawSignOptions: Parameters<typeof privy.wallets.prototype.rawSign>[1] = {
      params: { hash },
      ...(authorizationKey && {
        authorization_context: {
          authorization_private_keys: [authorizationKey],
        },
      }),
    };

    const result = await privy.wallets().rawSign(walletId, rawSignOptions);

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
