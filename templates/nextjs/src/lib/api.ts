/**
 * Lightweight native `fetch` wrapper.
 *
 * Zero external HTTP dependencies (no axios/ofetch), so framework `fetch` options keep working.
 * Retries belong to TanStack Query (`makeQueryClient`), not to this client.
 */

/** `status` is 0 when no response arrived (network failure, unreadable body). */
export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(message: string, status: number, data: unknown, options?: ErrorOptions) {
    super(message, options)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  /** Fails the request after this long, so a stalled API cannot hold up a server render. */
  timeoutMs?: number
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

function buildHeaders(init: HeadersInit | undefined, isJsonBody: boolean): Headers {
  const headers = new Headers(init)

  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  // FIXME: attach auth token once an auth solution is chosen, e.g.:
  // const token = await getAuthToken();
  // if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers
}

/** Reads the body as text first, so a broken body cannot hide the response status. */
function readPayload(text: string, contentType: string): unknown {
  if (!contentType.includes("application/json") || text === "") return text

  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const payload = readPayload(text, response.headers.get("content-type") ?? "")

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, payload)
  }
  if (payload === undefined) {
    throw new ApiError("The response is not valid JSON", response.status, text)
  }

  return payload as T
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { body, timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...rest } = options
  const isNative = isNativeBody(body)
  const timeout = AbortSignal.timeout(timeoutMs)

  try {
    const response = await fetch(url, {
      ...rest,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      headers: buildHeaders(rest.headers, body !== undefined && !isNative),
      body: isNative || body === undefined ? body : JSON.stringify(body)
    })

    return await parseResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) throw error
    // A cancelled request is not a failure: TanStack Query expects this error untouched.
    if (error instanceof Error && error.name === "AbortError") throw error
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new ApiError("The request timed out", 0, null, { cause: error })
    }

    throw new ApiError("Network request failed", 0, null, { cause: error })
  }
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "POST", body }),
  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "PUT", body }),
  patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "PATCH", body }),
  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "DELETE" })
}
