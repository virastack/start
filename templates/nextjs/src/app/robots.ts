import type { MetadataRoute } from "next";

import { env } from "@/env";

export default function robots(): MetadataRoute.Robots {
  // FIXME: Point sitemap to your public site URL (consider using NEXT_PUBLIC_SITE_URL)
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`
  };
}
