"use client"

import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query"

import { applyCoupon, removeCoupon } from "@/features/cart/api/coupon.api"
import { cartKeys } from "@/features/cart/api/query-keys"
import { selectCartItems } from "@/features/cart/api/selection.api"
import { updateCart } from "@/features/cart/api/update-cart.api"
import type { Cart } from "@/features/cart/schemas/cart.schema"

/**
 * Every change answers with the whole cart, which replaces the cached one. They share one key, so
 * `useIsCartBusy` can hold the controls until the answer is in: each request carries the whole
 * cart, and two at once would overwrite each other.
 */
function useCartMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<Cart>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: cartKeys.all,
    mutationFn,
    // A fetch still on its way would answer with the cart before this change, after it.
    onMutate: () => queryClient.cancelQueries({ queryKey: cartKeys.all }),
    onSuccess: (cart) => queryClient.setQueryData(cartKeys.all, cart)
  })
}

export function useUpdateCart() {
  return useCartMutation(updateCart)
}

export function useSelectCartItems() {
  return useCartMutation(
    ({ cart, itemIds, selected }: { cart: Cart; itemIds: number[]; selected: boolean }) =>
      selectCartItems(cart, itemIds, selected)
  )
}

export function useApplyCoupon() {
  return useCartMutation(({ cart, code }: { cart: Cart; code: string }) => applyCoupon(cart, code))
}

export function useRemoveCoupon() {
  return useCartMutation(removeCoupon)
}

export function useIsCartBusy() {
  return useIsMutating({ mutationKey: cartKeys.all }) > 0
}
