import Image from "next/image"

type ProductImageProps = {
  src: string
  /** Empty where a title right next to it already names the product. */
  alt?: string
  /** Loads at once, for images above the fold. */
  eager?: boolean
  sizes?: string
}

/**
 * `unoptimized` lets DummyJSON's images load without a `remotePatterns` entry. Add your own image
 * host to `images.remotePatterns` in `next.config.ts`, then remove it to get resized images.
 */
export function ProductImage({
  src,
  alt = "",
  eager = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
}: ProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      loading={eager ? "eager" : "lazy"}
      // The eager ones are above the fold, where the largest image of the first paint is.
      fetchPriority={eager ? "high" : undefined}
      sizes={sizes}
      className="object-contain p-4"
    />
  )
}
