import { NextRequest, NextResponse } from "next/server";
import { getPrivyClient } from "@/lib/privy-server";
import fs from "fs";
import path from "path";

// Persist wallet mappings to a JSON file so they survive hot reloads
const WALLETS_FILE = path.join(process.cwd(), ".wallets.json");

function loadWallets(): Record<string, { id: string; publicKey: string }> {
  try {
    if (fs.existsSync(WALLETS_FILE)) {
      return JSON.parse(fs.readFileSync(WALLETS_FILE, "utf-8"));
    }
  } catch {
    // Corrupted file, start fresh
  }
  return {};
}

function saveWallet(userId: string, wallet: { id: string; publicKey: string }) {
  const wallets = loadWallets();
  wallets[userId] = wallet;
  fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2));
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
    const wallets = loadWallets();

    // Check if we already have a wallet for this user
    let walletInfo = wallets[userId];

    if (!walletInfo) {
      // Create a new Starknet wallet for this user via Privy
      const wallet = await privy.wallets().create({
        chain_type: "starknet",
      });

      walletInfo = {
        id: wallet.id,
        publicKey: wallet.public_key,
      };
      saveWallet(userId, walletInfo);
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
