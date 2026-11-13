type ProductImageProps = {
  src: string
  /** Empty where a title right next to it already names the product. */
  alt?: string
  /** Loads at once, for images above the fold. */
  eager?: boolean
  sizes?: string
}

/** A plain image that fills its box: Vite has no image service to resize it. */
export function ProductImage({ src, alt = "", eager = false, sizes }: ProductImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      // The eager ones are above the fold, where the largest image of the first paint is.
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className="absolute inset-0 size-full object-contain p-4"
    />
  )
}
