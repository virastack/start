import path from "node:path";
import type { NextConfig } from "next";

import createBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.join(import.meta.dirname),
  },
  images: {
    remotePatterns: [
      // FIXME: add your own remote image domains here, e.g.:
      // { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
