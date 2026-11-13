/** A share preview: Open Graph and Twitter, in the form TanStack Router's `head().meta` takes. */
type ShareMeta = {
  title: string
  description: string
  /** The page's absolute address. */
  url: string
  image?: { url: string; alt: string } | null
}

/**
 * The page's own share preview. A child route's tag with the same `name` or `property` replaces
 * the root's, so each one stays once in the HTML.
 */
export function getShareMeta({ title, description, url, image }: ShareMeta) {
  return [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    ...(image
      ? [
          { property: "og:image", content: image.url },
          { property: "og:image:alt", content: image.alt },
          { name: "twitter:image", content: image.url }
        ]
      : []),
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description }
  ]
}
