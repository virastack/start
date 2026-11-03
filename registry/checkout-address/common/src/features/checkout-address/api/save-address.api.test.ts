import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { saveAddress } from "@/features/checkout-address/api/save-address.api"
import { ADDRESSES_PATH } from "@/features/checkout-address/constants/addresses.constants"
import { server } from "@/test/server"

const input = {
  addressName: "Home",
  firstName: "Ömer",
  lastName: "Gülçiçek",
  phone: "5550000000",
  addressLine: "Örnek Caddesi",
  provinceCode: "34",
  province: "İSTANBUL",
  district: "KADIKÖY",
  neighbourhood: "CAFERAĞA MAH.",
  postalCode: "34710",
  isDefault: false,
  addressType: "individual" as const,
  companyName: "",
  taxNumber: "",
  taxOffice: ""
}

describe("saveAddress", () => {
  it("posts a new address with its country", async () => {
    let body: unknown
    server.use(
      http.post(`${siteConfig.apiUrl}${ADDRESSES_PATH}/add`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 209 }, { status: 201 })
      })
    )

    const saved = await saveAddress(input)

    expect(body).toEqual({ ...input, countryCode: "TR" })
    expect(saved).toMatchObject(input)
    expect(saved.id).toEqual(expect.any(Number))
  })

  it("puts an edited address and keeps its id", async () => {
    let method = ""
    server.use(
      http.put(`${siteConfig.apiUrl}${ADDRESSES_PATH}/1`, ({ request }) => {
        method = request.method
        return HttpResponse.json({ id: 1 })
      })
    )

    await expect(saveAddress(input, 7)).resolves.toEqual({ ...input, id: 7 })
    expect(method).toBe("PUT")
  })
})
