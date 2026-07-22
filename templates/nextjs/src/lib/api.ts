/**
 * Lightweight native `fetch` wrapper.
 *
 * Zero external HTTP dependencies (no axios/ofetch) so it stays 100%
 * compatible with Next.js `fetch` caching/revalidation (`cache`, `next.revalidate`, `next.tags`).
 */

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  retry?: number;
  retryDelayMs?: number;
};

const DEFAULT_RETRY = 0;
const DEFAULT_RETRY_DELAY_MS = 300;

function buildHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // FIXME: attach auth token once an auth solution is chosen, e.g.:
  // const token = await getAuthToken();
  // if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, payload);
  }

  return payload as T;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { body, retry = DEFAULT_RETRY, retryDelayMs = DEFAULT_RETRY_DELAY_MS, ...rest } = options;

  let attempt = 0;

  while (true) {
    try {
      const response = await fetch(url, {
        ...rest,
        headers: buildHeaders(rest.headers),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      return await parseResponse<T>(response);
    } catch (error) {
      const isLastAttempt = attempt >= retry;
      const isServerOrNetworkError = !(error instanceof ApiError) || error.status >= 500;

      if (isLastAttempt || !isServerOrNetworkError) {
        throw error;
      }

      attempt += 1;
      await sleep(retryDelayMs * attempt);
    }
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
    request<T>(url, { ...options, method: "DELETE" }),
};
