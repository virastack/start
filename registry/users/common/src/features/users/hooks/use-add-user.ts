"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { addUser } from "@/features/users/api/add-user.api"
import { userKeys } from "@/features/users/api/query-keys"
import type { UserFormInput } from "@/features/users/schemas/user.schema"

export function useAddUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UserFormInput) => addUser(input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() })
  })
}
