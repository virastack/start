import { siteConfig } from "@/config/site.config"

import { baseLocale, getLocale, locales, localizeHref } from "@/paraglide/runtime.js"
import type { Locale } from "@/paraglide/runtime.js"

/** The `{-$lang}` route param of the current locale. The base locale has no URL prefix. */
export function getLangParam() {
  const locale = getLocale()

  return locale === baseLocale ? undefined : locale
}

/** The absolute URL of a path, such as `/users`, in the given locale. */
export function localizedUrl(path: string, locale: Locale) {
  return `${siteConfig.url}${localizeHref(path, { locale })}`
}

/** The `hreflang` alternates of a page, for a route's `head().links`. */
export function hreflangLinks(path: string) {
  return [
    ...locales.map((locale) => ({
      rel: "alternate",
      hrefLang: locale,
      href: localizedUrl(path, locale)
    })),
    { rel: "alternate", hrefLang: "x-default", href: localizedUrl(path, baseLocale) }
  ]
}
