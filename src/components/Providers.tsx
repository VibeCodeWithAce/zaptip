"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Configuration Error</h1>
          <p className="mt-2 text-zinc-400">
            NEXT_PUBLIC_PRIVY_APP_ID is not set. Add it to .env.local and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["google", "twitter", "email"],
        appearance: {
          theme: "dark",
          accentColor: "#22c55e",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
