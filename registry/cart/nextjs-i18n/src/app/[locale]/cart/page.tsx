import type { Metadata } from "next"

import { getTranslations, setRequestLocale } from "next-intl/server"

import { Cart } from "@/features/cart/components/Cart"

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Cart" })

  return {
    title: t("title"),
    // Each visitor has a cart of their own, so it is no page for search results.
    robots: { index: false, follow: true }
  }
}

/**
 * The server renders the page; the cart loads in the browser, with the visitor's own session, and
 * shows its skeleton until then.
 */
export default async function Page({ params }: PageProps) {
  setRequestLocale((await params).locale)
  const t = await getTranslations("Cart")

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <Cart />
    </main>
  )
}
