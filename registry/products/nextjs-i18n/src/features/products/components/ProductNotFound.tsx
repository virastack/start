import { useTranslations } from "next-intl"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import { ProductBackLink } from "@/features/products/components/ProductBackLink"

/**
 * A product that does not exist, with the way back to the list: the detail page's own state, and
 * the page the framework shows with the 404 status.
 */
export function ProductNotFound() {
  const t = useTranslations("Products")

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>{t("not_found_title")}</EmptyTitle>
        <EmptyDescription>{t("not_found_description")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ProductBackLink />
      </EmptyContent>
    </Empty>
  )
}
