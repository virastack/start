import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "tr"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Google advises against redirecting by language, so the URL alone decides the locale.
  localeDetection: false,
  localeCookie: false
})

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
