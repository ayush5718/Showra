import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  // Note: turbo.resolveAlias is not supported in Next.js 16.0.1
  // Using webpack config instead for resolve aliases
  turbopack: {
    // Empty config to silence Turbopack warning
    // Webpack config below handles aliases for non-Turbopack builds
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "three/tsl": "three/src/nodes/tsl/TSLCore.js",
      "three/addons": "three/examples/jsm",
    };
    return config;
  },
};

export default nextConfig;
