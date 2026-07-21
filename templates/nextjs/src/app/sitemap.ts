import type { MetadataRoute } from "next";

import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
  // FIXME: Set base URL and tune changeFrequency/priority; extend with more routes
  return [{ url: `${env.NEXT_PUBLIC_SITE_URL}/`, changeFrequency: "weekly", priority: 1 }];
}
