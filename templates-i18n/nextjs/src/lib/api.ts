import type { z } from "zod"

import { siteConfig } from "@/config/site.config"

/**
 * Native `fetch` wrapper with no HTTP dependency, so framework `fetch` options keep working.
 * Retries belong to TanStack Query (`makeQueryClient`). Bodies are read as text, so file
 * downloads use `fetch` directly; long uploads raise `timeoutMs`. The timeout signal opts out of
 * React's `fetch` memoization, so share server requests through a QueryClient or `cache()`.
 */

type ApiErrorKind = "http" | "network" | "timeout" | "parse"

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    /** `null` when no response arrived. */
    readonly status: number | null = null,
    readonly data: unknown = null,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.name = "ApiError"
  }
}

type RequestOptions<TSchema extends z.ZodType> = Omit<RequestInit, "body" | "method"> & {
  /** Added to the query string. `null` and `undefined` values are left out. */
  params?: Record<string, string | number | boolean | null | undefined>
  /** Validates the response. Without it the result is `unknown`. */
  schema?: TSchema
  /** Fails the request after this long, so a stalled API cannot hold up a server render. */
  timeoutMs?: number
}

type ApiConfig = {
  /** Prepended to paths that start with `/`. */
  baseUrl: string
  /** Auth headers: a token, or cookies on the server. Never sent to absolute URLs. */
  getHeaders?: () => HeadersInit | Promise<HeadersInit>
  /** Use `"include"` when an API on another origin relies on cookies. */
  credentials?: RequestCredentials
}

const DEFAULT_TIMEOUT_MS = 10_000
const INVALID_JSON = Symbol("invalid JSON")

const isNativeBody = (body: unknown): body is BodyInit =>
  body instanceof FormData ||
  body instanceof Blob ||
  body instanceof URLSearchParams ||
  body instanceof ArrayBuffer ||
  ArrayBuffer.isView(body) ||
  body instanceof ReadableStream

function withParams(url: string, params: RequestOptions<z.ZodType>["params"] = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) query.set(key, String(value))
  }
  const queryString = query.toString()

  if (!queryString) return url
  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`
}

function mergeHeaders(...sources: (HeadersInit | undefined)[]) {
  const merged = new Headers()
  for (const source of sources) {
    new Headers(source).forEach((value, key) => merged.set(key, value))
  }
  return merged
}

/** Reads the body as text first, so a broken body cannot hide the response status. */
function readPayload(text: string, contentType: string): unknown {
  if (text === "") return undefined
  // Also covers `application/problem+json` (RFC 9457).
  if (!contentType.includes("json")) return text

  try {
    return JSON.parse(text)
  } catch {
    return INVALID_JSON
  }
}

function parseResponse<TSchema extends z.ZodType>(
  response: Response,
  text: string,
  schema?: TSchema
): z.output<TSchema> {
  const { ok, status } = response
  const payload = readPayload(text, response.headers.get("content-type") ?? "")

  if (!ok) {
    const data = payload === INVALID_JSON ? text : payload
    throw new ApiError("http", `Request failed with status ${status}`, status, data)
  }
  if (payload === INVALID_JSON) {
    throw new ApiError("parse", "Response is not valid JSON", status, text)
  }
  // Without a schema, TSchema stays at its ZodUnknown default.
  if (!schema) return payload as z.output<TSchema>

  const result = schema.safeParse(payload)
  if (result.success) return result.data

  throw new ApiError("parse", "Response does not match its schema", status, result.error.issues, {
    cause: result.error
  })
}

export function createApi({ baseUrl, getHeaders, credentials }: ApiConfig) {
  const base = baseUrl.replace(/\/+$/, "")

  async function request<TSchema extends z.ZodType>(
    method: string,
    path: string,
    body: unknown,
    options: RequestOptions<TSchema> = {}
  ): Promise<z.output<TSchema>> {
    const { params, schema, timeoutMs = DEFAULT_TIMEOUT_MS, signal, headers, ...rest } = options
    const isJson = body !== undefined && !isNativeBody(body)
    const isOwnApi = path.startsWith("/")
    // Outside the try: a failing auth step is not a network error.
    const authHeaders = isOwnApi ? await getHeaders?.() : undefined
    const timeout = AbortSignal.timeout(timeoutMs)

    try {
      const response = await fetch(withParams(isOwnApi ? `${base}${path}` : path, params), {
        credentials,
        ...rest,
        method,
        headers: mergeHeaders(
          { Accept: "application/json" },
          isJson ? { "Content-Type": "application/json" } : undefined,
          authHeaders,
          headers
        ),
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        body: isJson ? JSON.stringify(body) : body
      })

      return parseResponse(response, await response.text(), schema)
    } catch (error) {
      const name = error instanceof Error ? error.name : ""
      // A cancelled request is not a failure: TanStack Query expects this error untouched.
      if (error instanceof ApiError || name === "AbortError") throw error
      if (name === "TimeoutError") {
        throw new ApiError("timeout", "The request timed out", null, null, { cause: error })
      }

      throw new ApiError("network", "Network request failed", null, null, { cause: error })
    }
  }

  const read =
    (method: string) =>
    <TSchema extends z.ZodType = z.ZodUnknown>(path: string, options?: RequestOptions<TSchema>) =>
      request<TSchema>(method, path, undefined, options)

  const write =
    (method: string) =>
    <TSchema extends z.ZodType = z.ZodUnknown>(
      path: string,
      body?: unknown,
      options?: RequestOptions<TSchema>
    ) =>
      request<TSchema>(method, path, body, options)

  return {
    get: read("GET"),
    post: write("POST"),
    put: write("PUT"),
    patch: write("PATCH"),
    delete: read("DELETE")
  }
}

// Add getHeaders here. Reading cookies on the server needs its own instance in a server module.
export const api = createApi({ baseUrl: siteConfig.apiUrl })
