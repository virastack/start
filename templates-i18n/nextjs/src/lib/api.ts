import type { z } from "zod"

import { siteConfig } from "@/config/site.config"

/**
 * Lightweight native `fetch` wrapper.
 *
 * Zero external HTTP dependencies (no axios/ofetch), so framework `fetch` options keep working.
 * Retries belong to TanStack Query (`makeQueryClient`), not to this client.
 */

export type ApiErrorKind = "http" | "network" | "timeout" | "parse"

type ApiErrorInit = {
  kind: ApiErrorKind
  message: string
  /** The response status. `null` when no response arrived. */
  status?: number | null
  data?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null
  readonly data: unknown

  constructor({ kind, message, status = null, data = null, cause }: ApiErrorInit) {
    super(message, { cause })
    this.name = "ApiError"
    this.kind = kind
    this.status = status
    this.data = data
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

function isNativeBody(body: unknown): body is BodyInit {
  return (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  )
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
  schema: TSchema | undefined
): z.output<TSchema> {
  const payload = readPayload(text, response.headers.get("content-type") ?? "")
  const { status } = response

  if (!response.ok) {
    throw new ApiError({
      kind: "http",
      message: `Request failed with status ${status}`,
      status,
      data: payload
    })
  }
  if (payload === undefined) {
    throw new ApiError({
      kind: "parse",
      message: "The response is not valid JSON",
      status,
      data: text
    })
  }
  // Without a schema, TSchema stays at its ZodUnknown default.
  if (!schema) return payload as z.output<TSchema>

  const result = schema.safeParse(payload)
  if (!result.success) {
    throw new ApiError({
      kind: "parse",
      message: "The response does not match its schema",
      status,
      data: result.error.issues,
      cause: result.error
    })
  }
  return result.data
}

export function createApi({ baseUrl, getHeaders }: ApiConfig) {
  async function request<TSchema extends z.ZodType = z.ZodUnknown>(
    method: string,
    path: string,
    body: unknown,
    options: RequestOptions<TSchema> = {}
  ): Promise<z.output<TSchema>> {
    const { schema, timeoutMs = DEFAULT_TIMEOUT_MS, signal, headers, ...rest } = options
    const isNative = isNativeBody(body)
    const timeout = AbortSignal.timeout(timeoutMs)

    try {
      const merged = new Headers({ Accept: "application/json" })
      new Headers(await getHeaders?.()).forEach((value, key) => merged.set(key, value))
      new Headers(headers).forEach((value, key) => merged.set(key, value))
      if (body !== undefined && !isNative && !merged.has("Content-Type")) {
        merged.set("Content-Type", "application/json")
      }

      const response = await fetch(path.startsWith("/") ? `${baseUrl}${path}` : path, {
        ...rest,
        method,
        headers: merged,
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        body: isNative || body === undefined ? body : JSON.stringify(body)
      })

      return parseResponse(response, await response.text(), schema)
    } catch (error) {
      if (error instanceof ApiError) throw error
      // A cancelled request is not a failure: TanStack Query expects this error untouched.
      if (error instanceof Error && error.name === "AbortError") throw error
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new ApiError({ kind: "timeout", message: "The request timed out", cause: error })
      }

      throw new ApiError({ kind: "network", message: "Network request failed", cause: error })
    }
  }

  return {
    get: <TSchema extends z.ZodType = z.ZodUnknown>(
      path: string,
      options?: RequestOptions<TSchema>
    ) => request<TSchema>("GET", path, undefined, options),
    post: <TSchema extends z.ZodType = z.ZodUnknown>(
      path: string,
      body?: unknown,
      options?: RequestOptions<TSchema>
    ) => request<TSchema>("POST", path, body, options),
    put: <TSchema extends z.ZodType = z.ZodUnknown>(
      path: string,
      body?: unknown,
      options?: RequestOptions<TSchema>
    ) => request<TSchema>("PUT", path, body, options),
    patch: <TSchema extends z.ZodType = z.ZodUnknown>(
      path: string,
      body?: unknown,
      options?: RequestOptions<TSchema>
    ) => request<TSchema>("PATCH", path, body, options),
    delete: <TSchema extends z.ZodType = z.ZodUnknown>(
      path: string,
      options?: RequestOptions<TSchema>
    ) => request<TSchema>("DELETE", path, undefined, options)
  }
}

export const api = createApi({ baseUrl: siteConfig.apiUrl })
