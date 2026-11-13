"use client"

import { useEffect, useState } from "react"
import type { KeyboardEvent, ReactNode } from "react"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"
import useEmblaCarousel from "embla-carousel-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ProductImage } from "@/features/products/components/ProductImage"

type ProductCarouselProps = {
  images: string[]
  title: string
  /** The image on screen. The carousel follows it and reports every move back. */
  selected: number
  onSelect: (index: number) => void
  /** Each slide's box, which sets the image's size. */
  slideClassName: string
  sizes: string
  /** Wraps a slide's image, such as in a button that opens it larger. */
  renderSlide?: (image: ReactNode, index: number) => ReactNode
  /** Shown over the top-right corner, such as the favourite button. */
  action?: ReactNode
}

/**
 * Embla, the engine shadcn's `carousel` wraps: that component needs a button size the templates
 * do not have. The page's gallery and the full-screen viewer both use this one.
 */
export function ProductCarousel({
  images,
  title,
  selected,
  onSelect,
  slideClassName,
  sizes,
  renderSlide = (image) => image,
  action
}: ProductCarouselProps) {
  const t = useTranslations("Products")
  const hasMany = images.length > 1
  // Read once: a changed option makes Embla start over, which would jump instead of slide.
  const [startIndex] = useState(selected)
  const [viewportRef, api] = useEmblaCarousel({ loop: hasMany, startIndex })

  // Swipes and arrows move the carousel itself, so the owner hears where it went.
  useEffect(() => {
    if (!api) return
    const onMove = () => onSelect(api.selectedScrollSnap())
    api.on("select", onMove)
    return () => {
      api.off("select", onMove)
    }
  }, [api, onSelect])

  // A thumbnail or the other carousel picked an image, so this one moves there.
  useEffect(() => {
    if (api && api.selectedScrollSnap() !== selected) api.scrollTo(selected)
  }, [api, selected])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") api?.scrollPrev()
    if (event.key === "ArrowRight") api?.scrollNext()
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={t("carousel_label", { title })}
        className="relative"
        onKeyDownCapture={onKeyDown}
      >
        <div ref={viewportRef} className="overflow-hidden rounded-xl">
          <div className="flex">
            {images.map((image, index) => (
              <div
                key={image}
                role="group"
                aria-roledescription="slide"
                aria-label={t("slide_label", { index: index + 1, total: images.length })}
                // A slide out of view is out of the tab order too, so focus cannot move the track
                // behind Embla's back.
                inert={index !== selected}
                className="min-w-0 shrink-0 grow-0 basis-full"
              >
                {renderSlide(
                  <div className={cn("relative bg-muted/50", slideClassName)}>
                    <ProductImage
                      src={image}
                      alt={
                        hasMany
                          ? t("image_alt", { title, index: index + 1, total: images.length })
                          : title
                      }
                      eager={index === selected}
                      sizes={sizes}
                    />
                  </div>,
                  index
                )}
              </div>
            ))}
          </div>
        </div>
        {hasMany && (
          <>
            <Button
              variant="secondary"
              size="icon"
              aria-label={t("previous_image")}
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full shadow-sm"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeftIcon aria-hidden />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label={t("next_image")}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full shadow-sm"
              onClick={() => api?.scrollNext()}
            >
              <ChevronRightIcon aria-hidden />
            </Button>
          </>
        )}
        {action && <div className="absolute top-3 right-3">{action}</div>}
      </div>
      {hasMany && (
        // The padding leaves room for the focus and selection rings, which the scroll area clips.
        <ul aria-label={t("images_label")} className="flex gap-2 overflow-x-auto p-1">
          {images.map((image, index) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                aria-label={t("show_image", { index: index + 1, total: images.length })}
                aria-pressed={index === selected}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-md bg-muted/50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  index === selected ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                )}
                onClick={() => onSelect(index)}
              >
                <ProductImage src={image} sizes="64px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
