import { QueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api"

const MAX_RETRIES = 1

/** A client error (4xx) stays the same on retry; server and network failures may pass. */
function shouldRetry(failureCount: number, error: Error) {
  const isClientError = error instanceof ApiError && error.status >= 400 && error.status < 500

  return !isClientError && failureCount < MAX_RETRIES
}

/**
 * Creates a new QueryClient with sane defaults.
 * A factory (instead of a singleton) avoids sharing cache across requests
 * in server contexts and across users in a serverless environment.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: shouldRetry
      }
    }
  })
}
