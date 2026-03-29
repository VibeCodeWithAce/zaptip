import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WALLETS_FILE = path.join(process.cwd(), ".wallets.json");

export async function POST() {
  try {
    if (fs.existsSync(WALLETS_FILE)) {
      fs.unlinkSync(WALLETS_FILE);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset wallet error:", error);
    return NextResponse.json({ error: "Failed to reset" }, { status: 500 });
  }
}
