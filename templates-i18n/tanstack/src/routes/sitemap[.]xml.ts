import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = new Date().toISOString()
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteConfig.url}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`

        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" }
        })
      }
    }
  }
})
