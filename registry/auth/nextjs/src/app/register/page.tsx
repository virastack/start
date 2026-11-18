import type { Metadata } from "next"

import { RegisterForm } from "@/features/auth/components/RegisterForm"

export const metadata: Metadata = {
  title: "Create account",
  // A form page with nothing to find, so it stays out of search results.
  robots: { index: false, follow: true }
}

/** The server renders the page; the form works in the browser, where the session lives. */
export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Choose a username and a password for your new account.
        </p>
      </div>
      <RegisterForm />
    </main>
  )
}
