import { QueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api"

const MAX_RETRIES = 1

/** Only failures that can pass on their own are retried: not client errors or bad responses. */
function shouldRetry(failureCount: number, error: Error) {
  const isTemporary =
    error instanceof ApiError &&
    (error.kind === "network" ||
      error.kind === "timeout" ||
      (error.kind === "http" && error.status !== null && error.status >= 500))

  return isTemporary && failureCount < MAX_RETRIES
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
