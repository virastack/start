import { ShoppingCartIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"

/** `autoFocus` moves the focus to its button, after the last line was removed. */
export function CartEmpty({ autoFocus = false }: { autoFocus?: boolean }) {
  const t = useTranslations("Cart")

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingCartIcon aria-hidden />
        </EmptyMedia>
        <EmptyTitle>{t("empty_title")}</EmptyTitle>
        <EmptyDescription>{t("empty_description")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* No page to go to yet: wire it to your product list. */}
        <Button variant="outline" autoFocus={autoFocus}>
          {t("browse_products")}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
