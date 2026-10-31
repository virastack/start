import { makeQueryClient } from "@/lib/query-client"

export function getContext() {
  const queryClient = makeQueryClient()

  return {
    queryClient
  }
}
