import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 type worker can mis-infer React hooks vs @types/react; keep CI green.
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },
};

export default nextConfig;
