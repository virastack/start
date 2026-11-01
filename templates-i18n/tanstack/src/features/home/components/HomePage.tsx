import { Link } from "@tanstack/react-router"
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"

import { getLangParam } from "@/helpers/localized-url"

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { buttonVariants } from "@/components/ui/button"
import { StackList } from "@/features/home/components/StackList"
import { getNextSteps, getResourceLinks } from "@/features/home/constants/home.constants"
import * as m from "@/paraglide/messages.js"

export function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-14 px-4 py-20 sm:gap-16 sm:px-6 sm:py-24">
      <div className="absolute top-4 right-4 flex items-center gap-2 sm:top-6 sm:right-6">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <header className="flex flex-col items-center gap-6 text-center">
        {/*
         * The brand lockup: every size derives from --f, so the overlap stays proportional.
         * The page-coloured fill hides the contours variable fonts overlap, so the stroke is doubled.
         */}
        <div className="flex w-full flex-col items-center [--f:17vw] sm:[--f:104px] lg:[--f:120px]">
          <span
            aria-hidden
            className="block [mask-image:linear-gradient(to_bottom,black_10%,transparent_80%)] px-[0.08em] text-(length:--f) leading-[0.95] font-bold tracking-tight whitespace-nowrap text-background select-none [-webkit-text-stroke-color:var(--foreground)] [-webkit-text-stroke-width:2px] [paint-order:stroke_fill] sm:[-webkit-text-stroke-width:3px]"
          >
            ViraStack
          </span>
          <h1 className="relative mt-[calc(var(--f)*-0.76)] text-[calc(var(--f)*1.0667)] leading-[1.05] font-black tracking-tight text-green-600 dark:text-green-500">
            <span className="sr-only">ViraStack </span>
            Start
          </h1>
        </div>
        <p className="text-balance text-muted-foreground">{m.site_description()}</p>
        <Link
          to="/{-$lang}/users"
          params={{ lang: getLangParam() }}
          className={buttonVariants({ size: "lg", className: "group" })}
        >
          {m.home_cta()}
          <ArrowRightIcon
            aria-hidden
            className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      </header>

      <section aria-labelledby="next-steps-heading" className="flex flex-col gap-3">
        <h2 id="next-steps-heading" className="font-semibold">
          {m.home_next_steps()}
        </h2>
        <ol className="flex flex-col gap-3">
          {getNextSteps().map(({ title, path }) => (
            <li
              key={path}
              className="flex flex-col gap-1 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              {title}
              <code className="font-mono text-xs break-all text-muted-foreground">{path}</code>
            </li>
          ))}
        </ol>
      </section>

      <StackList />

      <nav aria-label={m.home_links_label()} className="flex flex-wrap justify-center gap-2">
        {getResourceLinks().map(({ label, href }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            {label}
            <ArrowUpRightIcon aria-hidden />
          </a>
        ))}
      </nav>
    </main>
  )
}
