import type { Metadata } from "next"

import { siteConfig } from "@/config/site.config"

import { getPathname, routing } from "@/i18n/routing"

const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage]
  },
  icons: {
    icon: "/logo.webp"
  },
  robots: {
    index: true,
    follow: true
  }
}

const OPEN_GRAPH_LOCALES: Record<string, string> = { en: "en_US", tr: "tr_TR" }

export function getLocalizedMetadata(locale: string, description: string): Metadata {
  return {
    ...defaultMetadata,
    description,
    openGraph: { ...defaultMetadata.openGraph, description, locale: OPEN_GRAPH_LOCALES[locale] },
    twitter: { ...defaultMetadata.twitter, description }
  }
}

function getLocalizedUrl(locale: string, href: string) {
  return new URL(getPathname({ locale, href }), siteConfig.url).href
}

/** One absolute URL per language, plus `x-default` for visitors no language matches. */
export function getLanguageUrls(href: string): Record<string, string> {
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, getLocalizedUrl(locale, href)])),
    "x-default": getLocalizedUrl(routing.defaultLocale, href)
  }
}

export function getPageAlternates(locale: string, href: string): Metadata["alternates"] {
  return { canonical: getLocalizedUrl(locale, href), languages: getLanguageUrls(href) }
}
