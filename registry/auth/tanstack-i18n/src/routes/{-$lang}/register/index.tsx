import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

import { RegisterForm } from "@/features/auth/components/RegisterForm"
import * as m from "@/paraglide/messages"

export const Route = createFileRoute("/{-$lang}/register/")({
  head: () => ({
    meta: [
      { title: `${m.auth_register_title()} · ${siteConfig.name}` },
      // A form page with nothing to find, so it stays out of search results.
      { name: "robots", content: "noindex, follow" }
    ]
  }),
  component: RegisterPage
})

/** The server renders the page; the form works in the browser, where the session lives. */
function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{m.auth_register_title()}</h1>
        <p className="text-sm text-muted-foreground">{m.auth_register_description()}</p>
      </div>
      <RegisterForm />
    </main>
  )
}
