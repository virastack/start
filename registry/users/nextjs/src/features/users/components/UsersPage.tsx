import type { ReactNode } from "react"
import Link from "next/link"

import { ArrowLeftIcon } from "lucide-react"

import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { buttonVariants } from "@/components/ui/button"

type UsersPageProps = {
  children: ReactNode
}

/** The page frame. The route passes the list in, so the header shows while it loads. */
export function UsersPage({ children }: UsersPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div>
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeftIcon aria-hidden />
          Start page
        </Link>
      </div>
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-pretty text-muted-foreground">Live data from DummyJSON.</p>
        </div>
      </header>
      {children}
      <footer className="flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground">
        <GuideRow label="This demo:" items={["src/features/users"]} />
        <GuideRow
          label="Your API:"
          items={["NEXT_PUBLIC_API_URL", "api/", "schemas/", "AddUserForm"]}
        />
        <GuideRow
          label="To remove:"
          items={["src/features/users", "src/app/users", "DEMO_PATH = null"]}
        />
      </footer>
    </main>
  )
}

function GuideRow({ label, items }: { label: string; items: string[] }) {
  return (
    <p className="flex flex-wrap items-center gap-1.5">
      {label}
      {items.map((item) => (
        <code key={item} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs break-all">
          {item}
        </code>
      ))}
    </p>
  )
}
