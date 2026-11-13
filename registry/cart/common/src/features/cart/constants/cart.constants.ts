import type { Coupon } from "@/features/cart/schemas/cart.schema"

/** DummyJSON's cart of its first user. With your API, the visitor's own cart. */
export const CART_PATH = "/carts/1"
/** Where a product's page lives: the `products` module's, `/products/<id>`. */
export const PRODUCTS_ROUTE = "/products"
/** DummyJSON's prices are in US dollars. */
export const CART_CURRENCY = "USD"
/** The most of one product the stepper allows. Your API's stock limit belongs here. */
export const MAX_QUANTITY = 10

/**
 * DummyJSON has no coupons, so these stand in until your API checks a code. A code matches in
 * any letter case.
 */
export const DUMMY_COUPONS: Coupon[] = [
  { code: "WELCOME10", percent: 10 },
  { code: "SAVE20", percent: 20 }
]
