import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack to handle starkzap's optional peer deps
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ignore optional starkzap peer dependencies
      "@hyperlane-xyz/sdk": false,
      "@hyperlane-xyz/registry": false,
      "@hyperlane-xyz/utils": false,
      "@solana/web3.js": false,
      "@cartridge/controller": false,
      "@farcaster/mini-app-solana": false,
    };
    return config;
  },
  // Skip type checking during build (handled by IDE/CI separately)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
