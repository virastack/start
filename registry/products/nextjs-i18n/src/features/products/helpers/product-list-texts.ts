import type { useTranslations } from "next-intl"

import type { ProductListTexts } from "@/features/products/helpers/product-seo"

/** The `Products` messages, on the server (`getTranslations`) or the client (`useTranslations`). */
type Translate = ReturnType<typeof useTranslations<"Products">>

/** The list's title and description words in the visitor's language, for the metadata and the tab. */
export function getProductListTexts(t: Translate): ProductListTexts {
  return {
    title: t("title"),
    searchTitle: (query) => t("meta_search_title", { query }),
    pageTitle: (base, page) => t("meta_page_title", { title: base, page }),
    description: t("meta_description"),
    listDescription: (count) => t("meta_list_description", { count }),
    categoryDescription: (count, category) => t("meta_category_description", { count, category }),
    searchDescription: (count, query) => t("meta_search_description", { count, query })
  }
}
