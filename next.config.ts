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
  experimental: {
    turbo: {
      resolveAlias: {
        "three/tsl": "three/src/nodes/tsl/TSLCore.js",
      },
    },
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
