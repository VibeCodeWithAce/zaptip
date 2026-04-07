import { NextRequest, NextResponse } from "next/server";
import { getPrivyClient } from "@/lib/privy-server";
import { redis } from "@/lib/redis";
import crypto from "crypto";

/**
 * GET /api/tongo-key — retrieve existing Tongo private key for the authed user.
 * POST /api/tongo-key — generate & store a new Tongo private key if none exists.
 *
 * Redis key: tongo_key:{userId}
 * Value: hex-encoded 32-byte private key
 */

async function getUserId(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing authorization header");
  }
  const accessToken = authHeader.slice(7);
  const privy = getPrivyClient();
  const claims = await privy.utils().auth().verifyAccessToken(accessToken);
  if (!claims.user_id) throw new Error("Invalid token: no user_id");
  return claims.user_id;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const key = await redis.get<string>(`tongo_key:${userId}`);
    if (!key) {
      return NextResponse.json({ key: null });
    }
    return NextResponse.json({ key });
  } catch (error) {
    console.error("tongo-key GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    // Return existing key if already generated
    const existing = await redis.get<string>(`tongo_key:${userId}`);
    if (existing) {
      return NextResponse.json({ key: existing, created: false });
    }

    // Generate a random private key within the Stark curve order: 1 <= key < n
    const STARK_CURVE_ORDER = BigInt(
      "3618502788666131213697322783095070105526743751716087489154079457884512865583"
    );
    const rawKey = BigInt("0x" + crypto.randomBytes(32).toString("hex"));
    const validKey = (rawKey % (STARK_CURVE_ORDER - 1n)) + 1n;
    const privateKey = "0x" + validKey.toString(16);
    await redis.set(`tongo_key:${userId}`, privateKey);

    return NextResponse.json({ key: privateKey, created: true });
  } catch (error) {
    console.error("tongo-key POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: error instanceof Error && error.message.includes("authorization") ? 401 : 500 }
    );
  }
}
