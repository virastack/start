"use client"

import { StarIcon } from "lucide-react"
import { cn } from "cn"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { useFavoriteIds } from "@/features/users/hooks/use-favorite-ids"
import { useFavoritesStore } from "@/features/users/stores/favorites.store"

type FavoriteButtonProps = {
  userId: number
  userName: string
}

export function FavoriteButton({ userId, userName }: FavoriteButtonProps) {
  const t = useTranslations("Users")
  const isFavorite = useFavoriteIds().includes(userId)
  const toggle = useFavoritesStore((state) => state.toggle)

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("favorite_user", { name: userName })}
      aria-pressed={isFavorite}
      onClick={() => toggle(userId)}
    >
      <StarIcon aria-hidden className={cn("size-4", isFavorite && "fill-current")} />
    </Button>
  )
}
