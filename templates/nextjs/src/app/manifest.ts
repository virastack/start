import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site.config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    // FIXME: add 192x192 and 512x512 icons to make the app installable.
    icons: [
      {
        src: "/logo.webp",
        sizes: "96x96",
        type: "image/webp"
      }
    ]
  }
}
