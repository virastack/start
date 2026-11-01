import { createFileRoute, notFound, redirect } from "@tanstack/react-router"

import { baseLocale, isLocale } from "@/paraglide/runtime.js"

export const Route = createFileRoute("/{-$lang}")({
  beforeLoad: ({ params: { lang }, location }) => {
    if (lang === undefined) return

    if (!isLocale(lang)) throw notFound()

    // The base locale lives without a prefix, so `/en/users?page=2` moves to `/users?page=2`.
    if (lang === baseLocale) {
      const rest = location.href.slice(`/${lang}`.length)
      throw redirect({ href: rest.startsWith("/") ? rest : `/${rest}`, statusCode: 301 })
    }
  }
})
