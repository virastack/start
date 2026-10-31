import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import interCss from "@fontsource-variable/inter/index.css?url"
import { NuqsAdapter } from "nuqs/adapters/tanstack-router"

import { seoHeadMeta } from "@/config/seo.config"

import appCss from "@/styles/tailwind.css?url"

import TanStackQueryDevtools from "@/providers/devtools"
import { Providers } from "@/providers/Providers"

import { DefaultCatchBoundary } from "@/components/shared/DefaultCatchBoundary"
import { NotFound } from "@/components/shared/NotFound"
import { getLocale } from "@/paraglide/runtime.js"

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seoHeadMeta()
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: interCss },
      { rel: "icon", href: "/logo.webp" },
      { rel: "apple-touch-icon", href: "/logo.webp" },
      { rel: "manifest", href: "/site.webmanifest" }
    ]
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent
})

function RootComponent() {
  return (
    <NuqsAdapter>
      <Providers>
        <Outlet />
      </Providers>
    </NuqsAdapter>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const lang = getLocale()
  return (
    <html lang={lang} className="h-full" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-full flex-col font-sans antialiased" suppressHydrationWarning>
        {children}
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />
              },
              TanStackQueryDevtools
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
