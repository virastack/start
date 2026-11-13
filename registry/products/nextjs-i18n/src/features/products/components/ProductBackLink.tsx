import { ArrowLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { ProductLink } from "@/features/products/components/ProductLink"

/** Back to the list, from a product or from a product that is not there. */
export function ProductBackLink() {
  const t = useTranslations("Products")

  return (
    <ProductLink className={buttonVariants({ variant: "ghost", size: "sm" })}>
      <ArrowLeftIcon aria-hidden />
      {t("all_products")}
    </ProductLink>
  )
}
