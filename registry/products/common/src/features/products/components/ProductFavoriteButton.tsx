"use client"

import { useState } from "react"

import { HeartIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

/**
 * A favourite toggle. There is no favourites list yet, so it is kept for this visit and a toast
 * stands where a favourites module's call goes.
 */
export function ProductFavoriteButton({ title }: { title: string }) {
  const [isFavorite, setIsFavorite] = useState(false)

  const toggle = () => {
    const next = !isFavorite
    setIsFavorite(next)
    toast.success(next ? "Added to favorites" : "Removed from favorites", { description: title })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Favorite"
      aria-pressed={isFavorite}
      className="rounded-full"
      onClick={toggle}
    >
      <HeartIcon aria-hidden className={isFavorite ? "fill-red-500 text-red-500" : undefined} />
    </Button>
  )
}
