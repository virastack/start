"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { login } from "@/features/auth/api/login.api"
import { authKeys } from "@/features/auth/api/query-keys"
import type { LoginFormInput } from "@/features/auth/schemas/auth.schema"

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LoginFormInput) => login(input),
    // The variables hold the password, so the mutation leaves the cache as soon as it can.
    gcTime: 0,
    onSuccess: (user) => queryClient.setQueryData(authKeys.session, user)
  })
}
