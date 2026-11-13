"use client"

import { useRef, useState } from "react"
import type { ReactNode } from "react"

import { ProductCarousel } from "@/features/products/components/ProductCarousel"
import { ProductImageViewer } from "@/features/products/components/ProductImageViewer"

type ProductGalleryProps = {
  images: string[]
  title: string
  /** Shown over the image's top-right corner, such as the favourite button. */
  action?: ReactNode
}

/** The page's images. A click opens them full screen, where the same image stays selected. */
export function ProductGallery({ images, title, action }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const slides = useRef<(HTMLButtonElement | null)[]>([])

  const openViewer = (index: number) => {
    setSelected(index)
    setIsViewerOpen(true)
  }

  return (
    <>
      <ProductCarousel
        images={images}
        title={title}
        selected={selected}
        onSelect={setSelected}
        slideClassName="aspect-square"
        sizes="(min-width: 768px) 50vw, 100vw"
        action={action}
        renderSlide={(image, index) => (
          <button
            ref={(element) => {
              slides.current[index] = element
            }}
            type="button"
            aria-label={`Open image ${index + 1} of ${images.length} in full screen`}
            className="block w-full cursor-zoom-in outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
            onClick={() => openViewer(index)}
          >
            {image}
          </button>
        )}
      />
      <ProductImageViewer
        images={images}
        title={title}
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        selected={selected}
        onSelect={setSelected}
        // The image on screen when it closes, which may not be the one it was opened from.
        getReturnFocus={() => slides.current[selected] ?? null}
      />
    </>
  )
}
