import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = `User-agent: *
Allow: /

Sitemap: ${siteConfig.url}/sitemap.xml
`

        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        })
      }
    }
  }
})
