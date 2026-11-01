"use client"

import { useEffect } from "react"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("Common")

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{t("error_title")}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{t("error_description")}</p>
      <div className="flex gap-3">
        <Button onClick={() => retry()}>{t("error_retry")}</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          {t("go_home")}
        </Button>
      </div>
    </div>
  )
}
