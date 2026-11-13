import Image from "next/image"

/**
 * `unoptimized` lets DummyJSON's images load without a `remotePatterns` entry. Add your own image
 * host to `images.remotePatterns` in `next.config.ts`, then remove it to get resized images.
 */
export function CartImage({ src }: { src: string }) {
  return <Image src={src} alt="" fill unoptimized sizes="6rem" className="object-contain p-2" />
}
