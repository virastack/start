"use client"

import { useQuery } from "@tanstack/react-query"

import { cartQueryOptions } from "@/features/cart/api/cart.queries"

/**
 * The cart, fetched in the browser: it belongs to the visitor and is no page for search results,
 * so the server renders the page around it and leaves the cart to the client, with the visitor's
 * own session. Coming back to the page keeps the changes in the cache.
 */
export function useCart() {
  return useQuery(cartQueryOptions)
}
