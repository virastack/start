import type { ComponentProps, ReactElement, ReactNode } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import type { RenderOptions } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"

import messages from "@/messages/en.json"

type ProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  /** The URL the component starts on, such as `"?page=2"`. */
  searchParams?: string
  onUrlUpdate?: ComponentProps<typeof NuqsTestingAdapter>["onUrlUpdate"]
}

/**
 * Renders a component with the app providers it expects: English messages.
 * Each call gets a fresh QueryClient without retries and its own URL state, so tests stay isolated.
 */
export function renderWithProviders(
  ui: ReactElement,
  { searchParams, onUrlUpdate, ...options }: ProvidersOptions = {}
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale="en" messages={messages}>
        <QueryClientProvider client={queryClient}>
          <NuqsTestingAdapter hasMemory searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
            {children}
          </NuqsTestingAdapter>
        </QueryClientProvider>
      </NextIntlClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
