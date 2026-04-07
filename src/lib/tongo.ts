// Tongo confidential transfer configuration.
// The contract address is set via env var so it can be updated without a redeploy.
export const TONGO_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS ??
  "0x03878c9fed06800adad7e4c15c8e3a0c53a1eba5c4e8b7a3ab4270e2a9e4dce1";
