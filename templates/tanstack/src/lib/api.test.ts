import { delay } from "msw"
import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { api, ApiError } from "@/lib/api"

import { server } from "@/test/server"

const ITEMS_URL = "https://api.example.com/items"

describe("api", () => {
  it("returns parsed JSON", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.json({ id: 1 })))

    await expect(api.get(ITEMS_URL)).resolves.toEqual({ id: 1 })
  })

  it("sends a JSON body and only then the content type", async () => {
    const seen: (string | null)[] = []
    server.use(
      http.all(ITEMS_URL, async ({ request }) => {
        seen.push(request.headers.get("content-type"))
        return HttpResponse.json(request.method === "POST" ? await request.json() : null)
      })
    )

    await expect(api.post(ITEMS_URL, { a: 1 })).resolves.toEqual({ a: 1 })
    await api.get(ITEMS_URL)
    expect(seen).toEqual(["application/json", null])
  })

  it("turns an error response into ApiError with its status and data", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.json({ message: "Nope" }, { status: 404 })))

    await expect(api.get(ITEMS_URL)).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      data: { message: "Nope" }
    })
  })

  it("turns a network failure into ApiError with status 0", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.error()))

    const error = await api.get(ITEMS_URL).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0 })
    expect((error as ApiError).cause).toBeDefined()
  })

  it("turns an unreadable JSON body into ApiError", async () => {
    server.use(
      http.get(
        ITEMS_URL,
        () => new HttpResponse("{broken", { headers: { "content-type": "application/json" } })
      )
    )

    await expect(api.get(ITEMS_URL)).rejects.toBeInstanceOf(ApiError)
  })

  it("rethrows AbortError untouched", async () => {
    server.use(
      http.get(ITEMS_URL, async () => {
        await delay("infinite")
        return HttpResponse.json(null)
      })
    )
    const controller = new AbortController()
    const pending = api.get(ITEMS_URL, { signal: controller.signal })

    controller.abort()

    await expect(pending).rejects.toMatchObject({ name: "AbortError" })
    await expect(pending).rejects.not.toBeInstanceOf(ApiError)
  })
})
