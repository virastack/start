import { create } from "zustand"

type AddressSelectionState = {
  /** Only ids: the addresses themselves stay in the Query cache. */
  shippingId: number | null
  billingId: number | null
  isBillingSameAsShipping: boolean
  setShippingId: (id: number) => void
  setBillingId: (id: number) => void
  setIsBillingSameAsShipping: (isSame: boolean) => void
}

// Client-only UI state, so a module-level store is fine.
export const useAddressSelectionStore = create<AddressSelectionState>()((set) => ({
  shippingId: null,
  billingId: null,
  isBillingSameAsShipping: true,
  setShippingId: (shippingId) => set({ shippingId }),
  setBillingId: (billingId) => set({ billingId }),
  setIsBillingSameAsShipping: (isBillingSameAsShipping) => set({ isBillingSameAsShipping })
}))
