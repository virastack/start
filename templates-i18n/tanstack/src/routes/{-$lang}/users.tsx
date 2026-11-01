import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

import { hreflangLinks } from "@/helpers/localized-url"

import { usersQueryOptions } from "@/features/users/api/user.queries"
import { UsersDirectory } from "@/features/users/components/UsersDirectory"
import { UsersDirectorySkeleton } from "@/features/users/components/UsersDirectorySkeleton"
import { UsersPage } from "@/features/users/components/UsersPage"
import { usersRouteSearch } from "@/features/users/schemas/users-params.schema"
import * as m from "@/paraglide/messages.js"

export const Route = createFileRoute("/{-$lang}/users")({
  ...usersRouteSearch,
  loaderDeps: ({ search: { page, q } }) => ({ page, q }),
  loader: async ({ context, deps }) => {
    // A failed prefetch is not dehydrated: the client fetches again and shows the error state.
    const prefetch = context.queryClient
      .query({ ...usersQueryOptions(deps), staleTime: "static" })
      .catch(noop)

    // The server waits so the HTML has the rows. In the browser, waiting would freeze the old
    // page until the new one arrives, so UsersDirectory dims the old rows while it loads.
    if (import.meta.env.SSR) await prefetch
  },
  head: () => ({
    meta: [
      { title: `${m.users_title()} · ${siteConfig.name}` },
      { name: "description", content: m.users_meta_description() },
      // A demo should not reach search results.
      { name: "robots", content: "noindex, nofollow" }
    ],
    links: hreflangLinks("/users")
  }),
  pendingComponent: () => (
    <UsersPage>
      <UsersDirectorySkeleton />
    </UsersPage>
  ),
  component: UsersRoute
})

function UsersRoute() {
  return (
    <UsersPage>
      <UsersDirectory />
    </UsersPage>
  )
}
