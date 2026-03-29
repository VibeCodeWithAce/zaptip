import { PrivyClient } from "@privy-io/node";

let client: PrivyClient | null = null;

export function getPrivyClient(): PrivyClient {
  if (!client) {
    client = new PrivyClient({
      appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
      appSecret: process.env.PRIVY_APP_SECRET!,
    });
  }
  return client;
}
