import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: {
      // Hero photo + background artwork travel with the event save (each is compressed in the browser to ~250 KB).
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
