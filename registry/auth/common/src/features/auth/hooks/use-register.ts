"use client"

import { useMutation } from "@tanstack/react-query"

import { register } from "@/features/auth/api/register.api"
import type { RegisterFormInput } from "@/features/auth/schemas/auth.schema"

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterFormInput) => register(input),
    // The variables hold the password, so the mutation leaves the cache as soon as it can.
    gcTime: 0
  })
}
