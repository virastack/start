import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

import { Cart } from "@/features/cart/components/Cart"

export const Route = createFileRoute("/cart/")({
  head: () => ({
    meta: [
      { title: `Cart · ${siteConfig.name}` },
      // Each visitor has a cart of their own, so it is no page for search results.
      { name: "robots", content: "noindex, follow" }
    ]
  }),
  component: CartPage
})

/**
 * The server renders the page; the cart loads in the browser, with the visitor's own session, and
 * shows its skeleton until then.
 */
function CartPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
      <Cart />
    </main>
  )
}
