import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { BrandLockup } from "@/features/home/components/BrandLockup"
import { StackList } from "@/features/home/components/StackList"
import { DEMO_PATH, NEXT_STEPS, RESOURCE_LINKS } from "@/features/home/constants/home.constants"
import { Link } from "@/i18n/routing"

export function HomePage() {
  const t = useTranslations("Home")
  const tCommon = useTranslations("Common")

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-14 px-4 pt-12 pb-20 sm:gap-16 sm:px-6 sm:pt-[216px] sm:pb-24">
      <header className="flex flex-col items-center gap-6 text-center">
        <h1 className="flex w-full justify-center">
          <span className="sr-only">ViraStack Start</span>
          <BrandLockup className="w-[85.2vw] overflow-visible sm:w-[521px] lg:w-[601px]" />
        </h1>
        <p className="text-balance text-muted-foreground">{tCommon("site_description")}</p>
        {DEMO_PATH && (
          <Link href={DEMO_PATH} className={buttonVariants({ size: "lg", className: "group" })}>
            {t("cta")}
            <ArrowRightIcon
              aria-hidden
              className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        )}
      </header>

      <section aria-labelledby="next-steps-heading" className="flex flex-col gap-3">
        <h2 id="next-steps-heading" className="text-center font-semibold sm:text-left">
          {t("next_steps_title")}
        </h2>
        <ol className="flex flex-col gap-3">
          {NEXT_STEPS.map(({ titleKey, path }) => (
            <li
              key={titleKey}
              className="flex flex-col items-center gap-1 text-center text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:text-left"
            >
              {t(titleKey)}
              <code className="font-mono text-xs break-all text-muted-foreground">{path}</code>
            </li>
          ))}
        </ol>
      </section>

      <StackList />

      <nav
        aria-label={t("links_label")}
        className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center"
      >
        {RESOURCE_LINKS.map(({ labelKey, href }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            {t(labelKey)}
            <ArrowUpRightIcon aria-hidden />
          </a>
        ))}
      </nav>
    </main>
  )
}
