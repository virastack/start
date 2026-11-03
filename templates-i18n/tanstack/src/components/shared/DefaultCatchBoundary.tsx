import type { ErrorComponentProps } from "@tanstack/react-router"
import { Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router"

import { getLangParam } from "@/helpers/localized-url"

import { Button } from "@/components/ui/button"
import * as m from "@/paraglide/messages.js"

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  })

  console.error(error)

  return (
    <div className="mx-auto flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{m.error_title()}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{m.error_description()}</p>
      <div className="flex gap-3">
        <Button onClick={() => router.invalidate()}>{m.error_retry()}</Button>
        {isRoot ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/{-$lang}" params={{ lang: getLangParam() }} />}
          >
            {m.go_home()}
          </Button>
        ) : (
          <Button variant="outline" onClick={() => window.history.back()}>
            {m.error_go_back()}
          </Button>
        )}
      </div>
    </div>
  )
}
