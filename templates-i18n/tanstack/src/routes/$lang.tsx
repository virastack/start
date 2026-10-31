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
  component: () => {
    const { lang } = Route.useParams()
    // key={lang} sayesinde dil değiştiğinde React tüm alt componentleri (sayfayı) yeniden render eder.
    // Bu sayede çeviriler anında güncellenir.
    return <Outlet key={lang} />
  }
})
