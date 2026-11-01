import type { ReactNode } from "react"

import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { buttonVariants } from "@/components/ui/button"
import { FavoritesCount } from "@/features/users/components/FavoritesCount"

type UsersPageProps = {
  children: ReactNode
}

/** The page frame. The route passes the list in, so the header shows while it loads. */
export function UsersPage({ children }: UsersPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeftIcon aria-hidden />
          Start page
        </Link>
        <ThemeToggle />
      </div>
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-pretty text-muted-foreground">Live data from DummyJSON.</p>
        </div>
        <FavoritesCount />
      </header>
      {children}
    </main>
  )
}
