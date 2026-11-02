import type { Address } from "@/features/checkout-address/schemas/address.schema"

/** DummyJSON has no address API, so its users stand in. Point this at your own API. */
export const ADDRESSES_PATH = "/users"

/**
 * Starting data until you connect an API. Province, district, neighbourhood and postal code match
 * the `@virastack/address` dataset; the street lines and phone numbers are made up.
 */
export const DUMMY_ADDRESSES: Address[] = [
  {
    id: 1,
    addressName: "Home",
    firstName: "Ömer",
    lastName: "Gülçiçek",
    phone: "5550000000",
    addressLine: "Örnek Caddesi, Deneme Apartmanı",
    provinceCode: "34",
    province: "İSTANBUL",
    district: "KADIKÖY",
    neighbourhood: "CAFERAĞA MAH.",
    postalCode: "34710",
    isDefault: true
  },
  {
    id: 2,
    addressName: "Work",
    firstName: "Ömer",
    lastName: "Gülçiçek",
    phone: "5550000001",
    addressLine: "Örnek Bulvarı, Deneme İş Merkezi",
    provinceCode: "06",
    province: "ANKARA",
    district: "ÇANKAYA",
    neighbourhood: "KIZILAY MAH.",
    postalCode: "06420",
    isDefault: false
  }
]

export const COUNTRY_CODE = "TR"

/** The phone mask, shared by the form and its resolver. */
export const PHONE_MASKS = { phone: { preset: "phone", country: "TR" } } as const
