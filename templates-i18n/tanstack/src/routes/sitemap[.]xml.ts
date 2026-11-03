import { createFileRoute } from "@tanstack/react-router"

import { localizedUrl } from "@/helpers/localized-url"

import { locales } from "@/paraglide/runtime.js"

const PATHS = ["/"]

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = new Date().toISOString()
        const urls = PATHS.flatMap((path) =>
          locales.map(
            (locale) => `  <url>
    <loc>${localizedUrl(path, locale)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${path === "/" ? "1.0" : "0.5"}</priority>
  </url>`
          )
        )
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`

        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" }
        })
      }
    }
  }
})
