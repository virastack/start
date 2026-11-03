"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { userKeys } from "@/features/users/api/query-keys"
import { updateUser } from "@/features/users/api/update-user.api"
import type { UserFormInput, UsersPage } from "@/features/users/schemas/user.schema"

type UpdateUserVariables = { id: number; input: UserFormInput }

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateUserVariables) => updateUser(id, input),
    // DummyJSON keeps nothing, so a refetch would undo this. With a real API, invalidate instead.
    onSuccess: (updated) =>
      queryClient.setQueriesData<UsersPage>(
        { queryKey: userKeys.lists() },
        (page) =>
          page && {
            ...page,
            users: page.users.map((user) => (user.id === updated.id ? updated : user))
          }
      )
  })
}
