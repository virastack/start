import type { ReactNode } from "react"

import { QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw/http"
import { afterEach, describe, expect, it, vi } from "vitest"

import { siteConfig } from "@/config/site.config"

import { makeQueryClient } from "@/lib/query-client"

import { LOGIN_PATH } from "@/features/auth/constants/auth.constants"
import { useLogin } from "@/features/auth/hooks/use-login"
import { useSession } from "@/features/auth/hooks/use-session"
import { server } from "@/test/server"

const emily = {
  id: 1,
  username: "emilys",
  email: "emily.johnson@x.dummyjson.com",
  firstName: "Emily",
  lastName: "Johnson"
}

afterEach(() => {
  vi.useRealTimers()
})

describe("useSession", () => {
  it("keeps the signed-in user while no page shows it, far past the cache's usual five minutes", async () => {
    server.use(http.post(`${siteConfig.apiUrl}${LOGIN_PATH}`, () => HttpResponse.json(emily)))
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // The app's own client, with its defaults.
    const queryClient = makeQueryClient()
    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }

    const signIn = renderHook(() => ({ session: useSession(), login: useLogin() }), {
      wrapper: Wrapper
    })
    await act(() => signIn.result.current.login.mutateAsync({ username: "emilys", password: "x" }))
    await waitFor(() => expect(signIn.result.current.session.data).toMatchObject(emily))

    // The visitor leaves the sign-in page for an hour.
    signIn.unmount()
    await act(() => vi.advanceTimersByTimeAsync(60 * 60 * 1000))

    const later = renderHook(() => useSession(), { wrapper: Wrapper })
    expect(later.result.current.data).toMatchObject(emily)
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(later.result.current.data).toMatchObject(emily)
  })
})
