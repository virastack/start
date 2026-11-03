"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useIsClient } from "usehooks-ts"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const t = useTranslations("Common")
  const { resolvedTheme, setTheme } = useTheme()
  const isClient = useIsClient()

  if (!isClient) {
    return <Button variant="outline" size="icon" aria-hidden className="size-8 opacity-0" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-8"
      aria-label={isDark ? t("theme_to_light") : t("theme_to_dark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon className="size-3.5" /> : <MoonIcon className="size-3.5" />}
    </Button>
  )
}
