import type { MetadataRoute } from "next"

import { getLanguageUrls } from "@/config/seo.config"

import { routing } from "@/i18n/routing"

const ROUTES = ["/", "/users"]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap((route) => {
    const languages = getLanguageUrls(route)

    return routing.locales.map((locale) => ({
      url: languages[locale] ?? route,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages }
    }))
  })
}
