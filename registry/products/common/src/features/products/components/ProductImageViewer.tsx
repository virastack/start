"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ProductCarousel } from "@/features/products/components/ProductCarousel"

type ProductImageViewerProps = {
  images: string[]
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  selected: number
  onSelect: (index: number) => void
  /** Where focus goes back on close. */
  getReturnFocus: () => HTMLElement | null
}

/** The product's images as large as the screen allows, with the same carousel as the page. */
export function ProductImageViewer({
  images,
  title,
  open,
  onOpenChange,
  selected,
  onSelect,
  getReturnFocus
}: ProductImageViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        finalFocus={getReturnFocus}
        className="flex h-dvh w-screen max-w-none flex-col justify-center gap-0 rounded-none p-4 pt-12 sm:h-[min(92dvh,960px)] sm:w-[min(92vw,1100px)] sm:rounded-xl"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <ProductCarousel
          images={images}
          title={title}
          selected={selected}
          onSelect={onSelect}
          slideClassName="h-[calc(100dvh-10rem)] sm:h-[min(70dvh,760px)]"
          sizes="100vw"
        />
      </DialogContent>
    </Dialog>
  )
}
