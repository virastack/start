import { createFileRoute, redirect } from "@tanstack/react-router"

import { baseLocale } from "@/paraglide/runtime.js"

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Geçici olarak as-needed kapatıldı. Ana sayfa /en adresine yönlendiriliyor.
    throw redirect({
      to: "/$lang",
      params: { lang: baseLocale }
    })
  }
})
