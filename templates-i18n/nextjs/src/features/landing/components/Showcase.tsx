import { useLocale, useTranslations } from "next-intl"

import { siteConfig } from "@/config/site.config"

import { formatDate } from "@/helpers/format-date"

import { CartDemo } from "@/features/landing/components/CartDemo"
import { ProjectFormDemo } from "@/features/landing/components/ProjectFormDemo"
import { RevealGroup, RevealItem } from "@/features/landing/components/Reveal"
import { UsersDemo } from "@/features/landing/components/UsersDemo"
import { featureCardClassName } from "@/features/landing/helpers/motion"

export function Showcase() {
  const t = useTranslations("Index")
  const locale = useLocale()

  return (
    <section id="showcase" className="mx-auto max-w-5xl px-6 pb-16">
      <RevealGroup className="mb-10 text-center">
        <RevealItem>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            {t("showcase_title")}
          </h2>
        </RevealItem>
        <RevealItem>
          <p className="mx-auto mt-3 max-w-2xl text-base text-balance text-muted-foreground">
            {t("showcase_subtitle")}
          </p>
        </RevealItem>
      </RevealGroup>

      <RevealGroup className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <RevealItem className={`${featureCardClassName} h-full min-h-0 [&>*]:min-h-0 [&>*]:flex-1`}>
          <UsersDemo />
        </RevealItem>

        <div className="flex flex-col gap-6">
          <RevealItem className={featureCardClassName}>
            <div className="mb-4">
              <h4 className="text-base font-semibold text-foreground md:text-lg">
                {t("showcase_project_title")}
              </h4>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {t.rich("showcase_project_desc", {
                  rhf: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
                  zod: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>
                })}
              </p>
            </div>
            <ProjectFormDemo />
          </RevealItem>

          <RevealItem className={`${featureCardClassName} flex flex-col`}>
            <div>
              <h4 className="text-base font-semibold text-foreground md:text-lg">
                {t("showcase_state_title")}
              </h4>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {t.rich("showcase_state_desc", {
                  zustand: (chunks) => (
                    <span className="font-semibold text-foreground">{chunks}</span>
                  )
                })}
              </p>
            </div>
            <CartDemo />
          </RevealItem>
        </div>
      </RevealGroup>

      <div className="mt-20 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <p suppressHydrationWarning>
          {t("showcase_footer_license", { year: new Date().getFullYear(), name: siteConfig.name })}
        </p>
        <p className="italic" suppressHydrationWarning>
          {t("showcase_footer_built", {
            date: formatDate(new Date(), locale === "tr" ? "tr-TR" : "en-US")
          })}
        </p>
      </div>
    </section>
  )
}
