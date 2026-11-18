import { queryOptions } from "@tanstack/react-query"

import { getSession } from "@/features/auth/api/get-session.api"
import { authKeys } from "@/features/auth/api/query-keys"

/**
 * The signed-in user lives only in this cache, in memory: nothing goes to `localStorage` or a
 * cookie from the browser. Wire your real session in `getSession` and in the `api` instance's
 * `getHeaders` or `credentials`, and guard your private pages in your own routes or proxy.
 */
export const sessionQueryOptions = queryOptions({
  queryKey: authKeys.session(),
  queryFn: getSession,
  // Only sign-in and sign-out change it: no refetch of the placeholder `getSession`, which answers
  // `null`, may sign the visitor out. With a real `getSession`, remove this line.
  staleTime: Infinity,
  // Kept while no page shows it, until a reload: the default would drop it five minutes after the
  // visitor leaves the sign-in page.
  gcTime: Infinity
})
