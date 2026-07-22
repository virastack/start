import { QueryClient } from "@tanstack/react-query";

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
        retry: 1,
      },
    },
  });
}
