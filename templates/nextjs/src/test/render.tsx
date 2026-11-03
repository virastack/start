import type { ComponentProps, ReactElement, ReactNode } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import type { RenderOptions } from "@testing-library/react"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"

type ProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  /** The URL the component starts on, such as `"?page=2"`. */
  searchParams?: string
  onUrlUpdate?: ComponentProps<typeof NuqsTestingAdapter>["onUrlUpdate"]
}

/**
 * Renders a component with the app providers it expects.
 * Each call gets a fresh QueryClient without retries and its own URL state, so tests stay isolated.
 */
export function renderWithProviders(
  ui: ReactElement,
  { searchParams, onUrlUpdate, ...options }: ProvidersOptions = {}
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter hasMemory searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
          {children}
        </NuqsTestingAdapter>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
