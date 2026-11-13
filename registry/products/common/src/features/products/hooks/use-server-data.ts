"use client"

import { useState } from "react"

import { useQueryClient } from "@tanstack/react-query"
import type { QueryKey } from "@tanstack/react-query"

/**
 * Puts what the server fetched into the cache, unless the cache already holds something newer.
 * `initialData` alone is ignored once the cache has the key, so coming back to a page would show
 * the older client copy and fetch it again.
 */
export function useServerData<T>(
  queryKey: QueryKey,
  data: T | null | undefined,
  updatedAt: number | undefined
) {
  const queryClient = useQueryClient()

  // Once per mount, before the query that reads the key subscribes, so it starts from this copy.
  useState(() => {
    if (data === null || data === undefined || updatedAt === undefined) return
    const state = queryClient.getQueryState(queryKey)
    if (!state || state.dataUpdatedAt < updatedAt) {
      queryClient.setQueryData(queryKey, data, { updatedAt })
    }
  })
}
