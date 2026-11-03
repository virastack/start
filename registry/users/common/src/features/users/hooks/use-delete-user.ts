"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteUser } from "@/features/users/api/delete-user.api"
import { userKeys } from "@/features/users/api/query-keys"
import type { UsersPage } from "@/features/users/schemas/user.schema"

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    // DummyJSON keeps nothing, so a refetch would undo this. With a real API, invalidate instead.
    onSuccess: ({ id }) =>
      queryClient.setQueriesData<UsersPage>({ queryKey: userKeys.lists() }, (page) =>
        page?.users.some((user) => user.id === id)
          ? {
              ...page,
              users: page.users.filter((user) => user.id !== id),
              total: page.total - 1
            }
          : page
      )
  })
}
