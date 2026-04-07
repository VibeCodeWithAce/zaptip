import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

/**
 * GET /api/tongo-recipient?address=0x...
 *
 * Looks up tongo_recipient:{address} in Redis.
 * Returns the { x, y } recipientId (public key) if the creator has enabled private tips.
 */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address param" }, { status: 400 });
  }

  const recipient = await redis.get<{ x: string; y: string }>(
    `tongo_recipient:${address}`
  );

  if (!recipient) {
    return NextResponse.json({ recipient: null });
  }

  return NextResponse.json({ recipient });
}

/**
 * POST /api/tongo-recipient
 * Body: { address: "0x...", recipient: { x: "...", y: "..." } }
 *
 * Stores the creator's Tongo recipientId so tippers can look it up.
 */
export async function POST(request: NextRequest) {
  try {
    const { address, recipient } = await request.json();

    if (!address || !recipient?.x || !recipient?.y) {
      return NextResponse.json(
        { error: "Missing address or recipient {x,y}" },
        { status: 400 }
      );
    }

    await redis.set(`tongo_recipient:${address}`, {
      x: String(recipient.x),
      y: String(recipient.y),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("tongo-recipient POST error:", error);
    return NextResponse.json(
      { error: "Failed to store recipient" },
      { status: 500 }
    );
  }
}
