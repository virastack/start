"use client"

import { useId } from "react"

import { SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ALL_CATEGORIES } from "@/features/products/constants/products.constants"
import { useCategories } from "@/features/products/hooks/use-categories"
import { productSortSchema } from "@/features/products/schemas/product.schema"
import type { ProductCategory, ProductSort } from "@/features/products/schemas/product.schema"

type ProductListToolbarProps = {
  q: string
  /** Empty while a search runs, because a search covers every category. */
  category: string
  sort: ProductSort
  initialCategories?: ProductCategory[] | null
  /** When the server fetched `initialCategories`. */
  categoriesUpdatedAt?: number
  onSearch: (value: string) => void
  onCategoryChange: (category: string) => void
  onSortChange: (sort: ProductSort) => void
}

export function ProductListToolbar({
  q,
  category,
  sort,
  initialCategories,
  categoriesUpdatedAt,
  onSearch,
  onCategoryChange,
  onSortChange
}: ProductListToolbarProps) {
  const t = useTranslations("Products")
  const searchId = useId()
  const categories = useCategories(initialCategories, categoriesUpdatedAt)
  const sortLabels: Record<ProductSort, string> = {
    featured: t("sort_featured"),
    "price-asc": t("sort_price_asc"),
    "price-desc": t("sort_price_desc"),
    rating: t("sort_rating"),
    discount: t("sort_discount"),
    title: t("sort_title")
  }
  const sortItems = productSortSchema.options.map((value) => ({ value, label: sortLabels[value] }))
  const categoryItems = [
    { value: ALL_CATEGORIES, label: t("all_categories") },
    ...(categories.data ?? []).map(({ slug, name }) => ({ value: slug, label: name }))
  ]

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Label htmlFor={searchId} className="sr-only">
          {t("search_label")}
        </Label>
        <SearchIcon
          aria-hidden
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={searchId}
          type="search"
          placeholder={t("search_label")}
          className="pl-9"
          value={q}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>

      <Select
        items={categoryItems}
        value={category || ALL_CATEGORIES}
        disabled={categories.isPending}
        onValueChange={(value) => onCategoryChange(!value || value === ALL_CATEGORIES ? "" : value)}
      >
        <SelectTrigger aria-label={t("category_label")} className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categoryItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={sortItems}
        value={sort}
        onValueChange={(value) => {
          const parsed = productSortSchema.safeParse(value)
          if (parsed.success) onSortChange(parsed.data)
        }}
      >
        <SelectTrigger aria-label={t("sort_label")} className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
