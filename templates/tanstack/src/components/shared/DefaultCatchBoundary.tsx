import type { ErrorComponentProps } from "@tanstack/react-router"
import { Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  })

  console.error(error)

  return (
    <div className="mx-auto flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while rendering this page. You can try again, or head back to
        the homepage.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => router.invalidate()}>Try again</Button>
        {isRoot ? (
          <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
            Go home
          </Button>
        ) : (
          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
        )}
      </div>
    </div>
  )
}
