"use client"

import { useEffect } from "react"

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">A critical error occurred</h1>
        <p className="max-w-md text-sm text-neutral-500">
          The application failed to render. Please try again.
        </p>
        <button
          onClick={() => retry()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
