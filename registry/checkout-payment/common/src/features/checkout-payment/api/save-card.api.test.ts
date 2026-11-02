import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { saveCard } from "@/features/checkout-payment/api/save-card.api"
import { tokenizeCard } from "@/features/checkout-payment/api/tokenize-card"
import { CARDS_PATH } from "@/features/checkout-payment/constants/cards.constants"
import { server } from "@/test/server"

const input = {
  cardNumber: "5400360000000003",
  holderName: "Ömer Gülçiçek",
  expiry: "1230",
  cvv: "123"
}

describe("tokenizeCard", () => {
  it("keeps only what is safe to send", async () => {
    const card = await tokenizeCard(input)

    expect(card).toMatchObject({
      brand: "mastercard",
      last4: "0003",
      expiry: "1230",
      holderName: "Ömer Gülçiçek"
    })
    expect(JSON.stringify(card)).not.toContain(input.cardNumber)
    expect(card).not.toHaveProperty("cvv")
  })
})

describe("saveCard", () => {
  it("posts the token without the card number or CVV", async () => {
    let body = ""
    server.use(
      http.post(`${siteConfig.apiUrl}${CARDS_PATH}/add`, async ({ request }) => {
        body = await request.text()
        return HttpResponse.json({ id: 209 }, { status: 201 })
      })
    )

    const saved = await saveCard(await tokenizeCard(input))

    expect(body).toContain("tok_dummy_")
    expect(body).toContain("0003")
    expect(body).not.toContain(input.cardNumber)
    expect(body).not.toContain("cvv")
    expect(saved.bank).toBeNull()
    expect(saved.id).toEqual(expect.any(Number))
  })
})
