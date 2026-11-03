import type { ReactElement, ReactNode } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/react-router"
import type { AnyRoute, RouterHistory } from "@tanstack/react-router"
import { render } from "@testing-library/react"
import type { RenderOptions } from "@testing-library/react"

export type UrlUpdateEvent = { queryString: string }

type TestRoute = { path: string } & Pick<AnyRoute["options"], "validateSearch" | "search">

type ProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  /** Renders the component in this route, for components that read it. Content appears async. */
  route?: TestRoute
  /** The URL the component starts on, such as `"?page=2"`. */
  searchParams?: string
  onUrlUpdate?: (event: UrlUpdateEvent) => void
}

function makeRouter(ui: ReactElement, route: TestRoute, history: RouterHistory) {
  // The router scrolls after each navigation and jsdom does not implement that.
  window.scrollTo = () => {}

  const rootRoute = createRootRoute()
  const testRoute = createRoute({ getParentRoute: () => rootRoute, ...route, component: () => ui })

  return createRouter({ routeTree: rootRoute.addChildren([testRoute]), history })
}

/**
 * Renders a component with the app providers it expects.
 * Each call gets a fresh QueryClient without retries and its own URL state, so tests stay isolated.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route, searchParams = "", onUrlUpdate, ...options }: ProvidersOptions = {}
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const history = createMemoryHistory({ initialEntries: [`${route?.path ?? "/"}${searchParams}`] })
  history.subscribe(({ location }) => onUrlUpdate?.({ queryString: location.search }))

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  const content = route ? <RouterProvider router={makeRouter(ui, route, history)} /> : ui

  return { ...render(content, { wrapper: Wrapper, ...options }), history }
}
