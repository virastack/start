import { delay } from "msw"
import { http, HttpResponse } from "msw/http"
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest"
import { z } from "zod"

import { api, ApiError, createApi } from "@/lib/api"

import { server } from "@/test/server"

const BASE_URL = "https://api.example.com"
const ITEMS_URL = `${BASE_URL}/items`
const client = createApi({ baseUrl: BASE_URL })
const itemSchema = z.object({ id: z.number() })

describe("api", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("prepends the base URL and leaves absolute URLs alone", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.json({ id: 1 })))

    await expect(client.get("/items")).resolves.toEqual({ id: 1 })
    await expect(api.get(ITEMS_URL)).resolves.toEqual({ id: 1 })
  })

  it("ignores a trailing slash on the base URL", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.json({ id: 1 })))

    await expect(createApi({ baseUrl: `${BASE_URL}/` }).get("/items")).resolves.toEqual({ id: 1 })
  })

  it("lets a failing getHeaders through as it is", async () => {
    const failure = new Error("No session")
    const authed = createApi({
      baseUrl: BASE_URL,
      getHeaders: () => {
        throw failure
      }
    })

    await expect(authed.get("/items")).rejects.toBe(failure)
  })

  it("validates with a schema and infers its type", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.json({ id: 1, extra: true })))

    const item = await client.get("/items", { schema: itemSchema })

    expectTypeOf(item).toEqualTypeOf<{ id: number }>()
    expect(item).toEqual({ id: 1 })
  })

  it("returns unknown without a schema", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.json({ id: 1 })))

    const item = await client.get("/items")

    expectTypeOf(item).toBeUnknown()
  })

  it("reports a schema mismatch as a parse error", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.json({ id: "1" })))

    await expect(client.get("/items", { schema: itemSchema })).rejects.toMatchObject({
      kind: "parse",
      status: 200
    })
  })

  it("adds headers from getHeaders, and a call can override them", async () => {
    const seen: (string | null)[] = []
    server.use(
      http.get(ITEMS_URL, ({ request }) => {
        seen.push(request.headers.get("authorization"))
        return HttpResponse.json(null)
      })
    )
    const authed = createApi({
      baseUrl: BASE_URL,
      getHeaders: async () => {
        await Promise.resolve()
        return { Authorization: "Bearer token" }
      }
    })

    await authed.get("/items")
    await authed.get("/items", { headers: { Authorization: "Bearer other" } })

    expect(seen).toEqual(["Bearer token", "Bearer other"])
  })

  it("sends a JSON body and only then the content type", async () => {
    const seen: (string | null)[] = []
    server.use(
      http.all(ITEMS_URL, async ({ request }) => {
        seen.push(request.headers.get("content-type"))
        return HttpResponse.json(request.method === "POST" ? await request.json() : null)
      })
    )

    await expect(client.post("/items", { a: 1 })).resolves.toEqual({ a: 1 })
    await client.get("/items")
    expect(seen).toEqual(["application/json", null])
  })

  it("passes FormData through untouched, without a JSON content type", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"))
    const form = new FormData()

    await client.post("/items", form)

    const init = fetchSpy.mock.calls[0]?.[1]
    expect(init?.body).toBe(form)
    expect(new Headers(init?.headers).has("content-type")).toBe(false)
  })

  it("turns an error response into an http error with its status and data", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.json({ message: "Nope" }, { status: 404 })))

    await expect(client.get("/items")).rejects.toMatchObject({
      name: "ApiError",
      kind: "http",
      status: 404,
      data: { message: "Nope" }
    })
  })

  it("reads application/problem+json as JSON", async () => {
    server.use(
      http.get(
        ITEMS_URL,
        () =>
          new HttpResponse(JSON.stringify({ title: "Not allowed" }), {
            status: 403,
            headers: { "content-type": "application/problem+json" }
          })
      )
    )

    await expect(client.get("/items")).rejects.toMatchObject({
      status: 403,
      data: { title: "Not allowed" }
    })
  })

  it("asks for JSON by default", async () => {
    let accept: string | null = null
    server.use(
      http.get(ITEMS_URL, ({ request }) => {
        accept = request.headers.get("accept")
        return HttpResponse.json(null)
      })
    )

    await client.get("/items")

    expect(accept).toBe("application/json")
  })

  it("keeps the status when an error response has a broken JSON body", async () => {
    server.use(
      http.get(
        ITEMS_URL,
        () =>
          new HttpResponse("<html>Bad Gateway</html>", {
            status: 502,
            headers: { "content-type": "application/json" }
          })
      )
    )

    await expect(client.get("/items")).rejects.toMatchObject({ kind: "http", status: 502 })
  })

  it("turns an unreadable success body into a parse error", async () => {
    server.use(
      http.get(
        ITEMS_URL,
        () => new HttpResponse("{broken", { headers: { "content-type": "application/json" } })
      )
    )

    await expect(client.get("/items")).rejects.toMatchObject({ kind: "parse", status: 200 })
  })

  it("returns an empty body without failing", async () => {
    server.use(http.delete(ITEMS_URL, () => new HttpResponse(null, { status: 204 })))

    await expect(client.delete("/items")).resolves.toBe("")
  })

  it("turns a network failure into a network error", async () => {
    server.use(http.get(ITEMS_URL, () => HttpResponse.error()))

    const error = await client.get("/items").catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: "network", status: null })
    expect((error as ApiError).cause).toBeDefined()
  })

  it("turns a timeout into a timeout error", async () => {
    server.use(
      http.get(ITEMS_URL, async () => {
        await delay("infinite")
        return HttpResponse.json(null)
      })
    )

    await expect(client.get("/items", { timeoutMs: 20 })).rejects.toMatchObject({
      kind: "timeout",
      status: null
    })
  })

  it("rethrows AbortError untouched", async () => {
    server.use(
      http.get(ITEMS_URL, async () => {
        await delay("infinite")
        return HttpResponse.json(null)
      })
    )
    const controller = new AbortController()
    const pending = client.get("/items", { signal: controller.signal })

    controller.abort()

    await expect(pending).rejects.toMatchObject({ name: "AbortError" })
    await expect(pending).rejects.not.toBeInstanceOf(ApiError)
  })
})
