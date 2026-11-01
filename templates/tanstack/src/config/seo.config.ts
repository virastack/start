import { siteConfig } from "@/config/site.config"

/** Shared SEO fields used by the root route `head()` and social meta tags. */
const defaultSeo = {
  title: siteConfig.name,
  titleTemplate: `%s · ${siteConfig.name}`,
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
  }
} as const

/** Flatten `defaultSeo` into TanStack Router `head().meta` entries. */
export function seoHeadMeta() {
  const og = defaultSeo.openGraph
  const twitter = defaultSeo.twitter

  return [
    { title: defaultSeo.title },
    { name: "description", content: defaultSeo.description },
    { name: "author", content: defaultSeo.creator },
    { name: "creator", content: defaultSeo.creator },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: og.type },
    { property: "og:locale", content: og.locale },
    { property: "og:url", content: og.url },
    { property: "og:title", content: og.title },
    { property: "og:description", content: og.description },
    { property: "og:site_name", content: og.siteName },
    { property: "og:image", content: og.images[0].url },
    { name: "twitter:card", content: twitter.card },
    { name: "twitter:title", content: twitter.title },
    { name: "twitter:description", content: twitter.description },
    { name: "twitter:image", content: twitter.images[0] }
  ]
}
