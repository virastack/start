import type { Metadata } from "next"

import { Cart } from "@/features/cart/components/Cart"

export const metadata: Metadata = {
  title: "Cart",
  // Each visitor has a cart of their own, so it is no page for search results.
  robots: { index: false, follow: true }
}

/**
 * The server renders the page; the cart loads in the browser, with the visitor's own session, and
 * shows its skeleton until then.
 */
export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
      <Cart />
    </main>
  )
}
