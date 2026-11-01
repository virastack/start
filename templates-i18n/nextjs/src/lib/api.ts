import type { z } from "zod"

import { siteConfig } from "@/config/site.config"

/**
 * Native `fetch` wrapper with no HTTP dependency, so framework `fetch` options keep working.
 * Retries belong to TanStack Query (`makeQueryClient`). Bodies are read as text, so file
 * downloads use `fetch` directly; long uploads raise `timeoutMs`.
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
  /** Validates the response. Without it the result is `unknown`. */
  schema?: TSchema
  /** Fails the request after this long, so a stalled API cannot hold up a server render. */
  timeoutMs?: number
}

type ApiConfig = {
  /** Prepended to paths that start with `/`. */
  baseUrl: string
  /** Runs before every request. Return auth headers here: a token, or cookies on the server. */
  getHeaders?: () => HeadersInit | Promise<HeadersInit>
}

const DEFAULT_TIMEOUT_MS = 10_000

const isNativeBody = (body: unknown): body is BodyInit =>
  body instanceof FormData ||
  body instanceof Blob ||
  body instanceof URLSearchParams ||
  body instanceof ArrayBuffer

function mergeHeaders(...sources: (HeadersInit | undefined)[]) {
  const merged = new Headers()
  for (const source of sources) {
    new Headers(source).forEach((value, key) => merged.set(key, value))
  }
  return merged
}

/** Reads the body as text first, so a broken body cannot hide the response status. */
function readPayload(text: string, contentType: string): unknown {
  // Also covers `application/problem+json` (RFC 9457).
  if (!contentType.includes("json") || text === "") return text

  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function parseResponse<TSchema extends z.ZodType>(
  response: Response,
  text: string,
  schema?: TSchema
): z.output<TSchema> {
  const { ok, status } = response
  const payload = readPayload(text, response.headers.get("content-type") ?? "")

  if (!ok) throw new ApiError("http", `Request failed with status ${status}`, status, payload)
  if (payload === undefined) throw new ApiError("parse", "Response is not valid JSON", status, text)
  // Without a schema, TSchema stays at its ZodUnknown default.
  if (!schema) return payload as z.output<TSchema>

  const result = schema.safeParse(payload)
  if (result.success) return result.data

  throw new ApiError("parse", "Response does not match its schema", status, result.error.issues, {
    cause: result.error
  })
}

export function createApi({ baseUrl, getHeaders }: ApiConfig) {
  const base = baseUrl.replace(/\/+$/, "")

  async function request<TSchema extends z.ZodType>(
    method: string,
    path: string,
    body: unknown,
    options: RequestOptions<TSchema> = {}
  ): Promise<z.output<TSchema>> {
    const { schema, timeoutMs = DEFAULT_TIMEOUT_MS, signal, headers, ...rest } = options
    const isJson = body !== undefined && !isNativeBody(body)
    const timeout = AbortSignal.timeout(timeoutMs)
    // Outside the try: a failing auth step is not a network error.
    const authHeaders = await getHeaders?.()

    try {
      const response = await fetch(path.startsWith("/") ? `${base}${path}` : path, {
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

export const api = createApi({ baseUrl: siteConfig.apiUrl })
