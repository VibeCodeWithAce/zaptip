// Tongo confidential transfer configuration.
// The contract address is set via env var so it can be updated without a redeploy.
export const TONGO_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS ??
  "0x3a542d7eb73b3e33a2c54e9827ec17a6365e289ec35ccc94dde97950d9db498";
