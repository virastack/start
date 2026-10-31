import { siteConfig } from "@/config/site.config"

import { formatDate } from "@/helpers"

import { CartDemo } from "@/features/landing/components/CartDemo"
import { ProjectFormDemo } from "@/features/landing/components/ProjectFormDemo"
import { RevealGroup, RevealItem } from "@/features/landing/components/Reveal"
import { UsersDemo } from "@/features/landing/components/UsersDemo"
import { featureCardClassName } from "@/features/landing/helpers"
import * as m from "@/paraglide/messages.js"
import { getLocale } from "@/paraglide/runtime.js"

export function Showcase() {
  const currentLang = getLocale()

  return (
    <section id="showcase" className="mx-auto max-w-5xl px-6 pb-16">
      <RevealGroup className="mb-10 text-center">
        <RevealItem>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            {m.showcase_title()}
          </h2>
        </RevealItem>
        <RevealItem>
          <p className="mx-auto mt-3 max-w-2xl text-base text-balance text-muted-foreground">
            {m.showcase_subtitle()}
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
                {m.showcase_project_title()}
              </h4>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {m.showcase_project_desc_1()}
                <span className="font-semibold text-foreground">React Hook Form</span>
                {m.showcase_project_desc_2()}
                <span className="font-semibold text-foreground">Zod</span>
                {m.showcase_project_desc_3()}
              </p>
            </div>
            <ProjectFormDemo />
          </RevealItem>

          <RevealItem className={`${featureCardClassName} flex flex-col`}>
            <div>
              <h4 className="text-base font-semibold text-foreground md:text-lg">
                {m.showcase_state_title()}
              </h4>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {m.showcase_state_desc_1()}
                <span className="font-semibold text-foreground">Zustand</span>
                {m.showcase_state_desc_2()}
              </p>
            </div>
            <CartDemo />
          </RevealItem>
        </div>
      </RevealGroup>

      <div className="mt-20 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <p suppressHydrationWarning>
          {m.showcase_footer_license({ year: new Date().getFullYear(), name: siteConfig.name })}
        </p>
        <p className="italic" suppressHydrationWarning>
          {m.showcase_footer_built({
            date: formatDate(new Date(), currentLang === "tr" ? "tr-TR" : "en-US")
          })}
        </p>
      </div>
    </section>
  )
}
