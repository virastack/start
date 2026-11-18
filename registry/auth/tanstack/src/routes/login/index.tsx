import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

import { LoginForm } from "@/features/auth/components/LoginForm"

export const Route = createFileRoute("/login/")({
  head: () => ({
    meta: [
      { title: `Sign in · ${siteConfig.name}` },
      // A form page with nothing to find, so it stays out of search results.
      { name: "robots", content: "noindex, follow" }
    ]
  }),
  component: LoginPage
})

/** The server renders the page; the form works in the browser, where the session lives. */
function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Sign in with your username.</p>
      </div>
      <LoginForm />
    </main>
  )
}
