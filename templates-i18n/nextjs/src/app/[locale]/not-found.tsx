import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

export default function NotFound() {
  const t = useTranslations("Common")

  return (
    <div className="mx-auto flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t("not_found_title")}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{t("not_found_description")}</p>
      <Button nativeButton={false} render={<Link href="/" />}>
        {t("go_home")}
      </Button>
    </div>
  )
}
