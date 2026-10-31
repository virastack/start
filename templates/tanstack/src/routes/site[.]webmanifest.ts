import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

export const Route = createFileRoute("/site.webmanifest")({
  server: {
    handlers: {
      GET: async () => {
        const manifest = {
          name: siteConfig.name,
          short_name: siteConfig.name,
          description: siteConfig.description,
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#ffffff",
          icons: [
            {
              src: "/logo.webp",
              sizes: "96x96",
              type: "image/webp"
            }
          ]
        }

        return Response.json(manifest, {
          headers: { "Content-Type": "application/manifest+json; charset=utf-8" }
        })
      }
    }
  }
})
