"use client";

import Link from "next/link";

import { DEFAULT_LOCALE } from "@/constants/i18n.constants";

import "@/styles/tailwind.css";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang={DEFAULT_LOCALE}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center text-foreground antialiased">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        {isDev && error?.message && (
          <p className="text-sm text-muted-foreground">{error.message}</p>
        )}
        <div className="flex gap-4">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            onClick={() => reset()}
          >
            Try again
          </button>
          <Link
            href={`/${DEFAULT_LOCALE}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            Go to home
          </Link>
        </div>
      </body>
    </html>
  );
}
