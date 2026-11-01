import { createFileRoute, notFound, Outlet } from "@tanstack/react-router"

import { locales, setLocale } from "@/paraglide/runtime.js"

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    const lang = params.lang

    // Geçici olarak as-needed kapatıldı. baseLocale için /'a yönlendirme iptal edildi.
    if (!locales.includes(lang as (typeof locales)[number])) {
      throw notFound()
    }

    setLocale(lang as (typeof locales)[number], { reload: false })
  },
  component: LangLayout
})

function LangLayout() {
  const { lang } = Route.useParams()
  // key re-renders the page with the new messages when the language changes.
  return <Outlet key={lang} />
}
