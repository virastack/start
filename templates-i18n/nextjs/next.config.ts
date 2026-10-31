import path from "node:path"
import type { NextConfig } from "next"

import createBundleAnalyzer from "@next/bundle-analyzer"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
})

const nextConfig: NextConfig = {
  reactCompiler: process.env.NODE_ENV === "production",
  turbopack: {
    root: path.join(import.meta.dirname)
  },
  images: {
    remotePatterns: [
      // FIXME: add your own remote image domains here, e.g.:
      // { protocol: "https", hostname: "images.unsplash.com" },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          }
        ]
      }
    ]
  }
}

export default withNextIntl(withBundleAnalyzer(nextConfig))
