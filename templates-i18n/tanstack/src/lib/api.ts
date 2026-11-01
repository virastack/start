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
}

function buildHeaders(init: HeadersInit | undefined, hasBody: boolean): Headers {
  const headers = new Headers(init)

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  // FIXME: attach auth token once an auth solution is chosen, e.g.:
  // const token = await getAuthToken();
  // if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, payload)
  }

  return payload as T
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...rest } = options
  const hasBody = body !== undefined

  try {
    const response = await fetch(url, {
      ...rest,
      headers: buildHeaders(rest.headers, hasBody),
      body: hasBody ? JSON.stringify(body) : undefined
    })

    return await parseResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) throw error
    // A cancelled request is not a failure: TanStack Query expects this error untouched.
    if (error instanceof Error && error.name === "AbortError") throw error

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
