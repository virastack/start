import { Suspense } from "react"
import type { Metadata } from "next"

import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { getPageAlternates } from "@/config/seo.config"

import { makeQueryClient } from "@/lib/query-client"

import { usersQueryOptions } from "@/features/users/api/user.queries"
import { UsersDirectory } from "@/features/users/components/UsersDirectory"
import { UsersDirectorySkeleton } from "@/features/users/components/UsersDirectorySkeleton"
import { UsersPage } from "@/features/users/components/UsersPage"
import { loadUsersParams } from "@/features/users/schemas/users-params.schema"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/users">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Users" })

  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: getPageAlternates(locale, "/users")
  }
}

export default async function UsersRoute({ params, searchParams }: PageProps<"/[locale]/users">) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <UsersPage>
      <Suspense fallback={<UsersDirectorySkeleton />}>
        <PrefetchedUsers searchParams={searchParams} />
      </Suspense>
    </UsersPage>
  )
}

// Reading searchParams makes this route dynamic, so `next build` never calls DummyJSON.
async function PrefetchedUsers({
  searchParams
}: Pick<PageProps<"/[locale]/users">, "searchParams">) {
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
