"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { logout } from "@/features/auth/api/login.api"
import { authKeys } from "@/features/auth/api/query-keys"

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    // With your API, also clear the queries that belong to the user: `queryClient.clear()`.
    onSuccess: () => queryClient.setQueryData(authKeys.session, null)
  })
}
