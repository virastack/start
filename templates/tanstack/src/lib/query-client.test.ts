import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import { api } from "@/lib/api"
import { makeQueryClient } from "@/lib/query-client"

import { server } from "@/test/server"

const ITEMS_URL = "https://api.example.com/items"

async function attemptsFor(respond: () => Response) {
  let attempts = 0
  server.use(
    http.get(ITEMS_URL, () => {
      attempts += 1
      return respond()
    })
  )

  await makeQueryClient()
    .fetchQuery({ queryKey: ["items"], queryFn: () => api.get(ITEMS_URL), retryDelay: 0 })
    .catch(() => undefined)

  return attempts
}

const status = (code: number) => () => HttpResponse.json(null, { status: code })

describe("makeQueryClient retries", () => {
  it.each([400, 401, 403, 404, 408, 422, 429])("does not retry %i", async (code) => {
    expect(await attemptsFor(status(code))).toBe(1)
  })

  it.each([500, 503])("retries %i once", async (code) => {
    expect(await attemptsFor(status(code))).toBe(2)
  })

  it("retries a network failure once", async () => {
    expect(await attemptsFor(() => HttpResponse.error())).toBe(2)
  })

  it("does not retry a response that fails its schema", async () => {
    let attempts = 0
    server.use(
      http.get(ITEMS_URL, () => {
        attempts += 1
        return HttpResponse.json({ id: "1" })
      })
    )

    await makeQueryClient()
      .fetchQuery({
        queryKey: ["items"],
        queryFn: () => api.get(ITEMS_URL, { schema: z.object({ id: z.number() }) }),
        retryDelay: 0
      })
      .catch(() => undefined)

    expect(attempts).toBe(1)
  })

  it("stops retrying once a request succeeds", async () => {
    let attempts = 0
    server.use(
      http.get(ITEMS_URL, () => {
        attempts += 1
        return attempts === 1
          ? HttpResponse.json(null, { status: 500 })
          : HttpResponse.json({ id: 1 })
      })
    )

    await expect(
      makeQueryClient().fetchQuery({
        queryKey: ["items"],
        queryFn: () => api.get(ITEMS_URL),
        retryDelay: 0
      })
    ).resolves.toEqual({ id: 1 })
    expect(attempts).toBe(2)
  })
})
