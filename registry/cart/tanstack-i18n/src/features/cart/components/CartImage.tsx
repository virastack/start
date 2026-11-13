/** A plain image that fills its box: Vite has no image service to resize it. */
export function CartImage({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className="absolute inset-0 size-full object-contain p-2"
    />
  )
}
