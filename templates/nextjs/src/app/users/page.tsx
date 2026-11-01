import { Suspense } from "react"
import type { Metadata } from "next"

import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query"

import { makeQueryClient } from "@/lib/query-client"

import { usersQueryOptions } from "@/features/users/api/user.queries"
import { UsersDirectory } from "@/features/users/components/UsersDirectory"
import { UsersDirectorySkeleton } from "@/features/users/components/UsersDirectorySkeleton"
import { UsersPage } from "@/features/users/components/UsersPage"
import { loadUsersParams } from "@/features/users/schemas/users-params.schema"

export const metadata: Metadata = {
  title: "Users",
  description: "A demo feature with a searchable user list, a validated form and favorites.",
  // A demo should not reach search results.
  robots: { index: false, follow: false }
}

export default function UsersRoute({ searchParams }: PageProps<"/users">) {
  return (
    <UsersPage>
      <Suspense fallback={<UsersDirectorySkeleton />}>
        <PrefetchedUsers searchParams={searchParams} />
      </Suspense>
    </UsersPage>
  )
}

// Reading searchParams makes this route dynamic, so `next build` never calls DummyJSON.
async function PrefetchedUsers({ searchParams }: Pick<PageProps<"/users">, "searchParams">) {
  const filters = await loadUsersParams(searchParams)
  const queryClient = makeQueryClient()
  // A failed prefetch is not dehydrated: the client fetches again and shows the error state.
  await queryClient.query(usersQueryOptions(filters)).catch(noop)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersDirectory />
    </HydrationBoundary>
  )
}
