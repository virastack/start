import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"

import { siteConfig } from "@/config/site.config"

import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { buttonVariants } from "@/components/ui/button"
import { BrandLockup } from "@/features/home/components/BrandLockup"
import { StackList } from "@/features/home/components/StackList"
import { DEMO_PATH, NEXT_STEPS, RESOURCE_LINKS } from "@/features/home/constants/home.constants"

export function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-14 px-4 pt-[280px] pb-20 sm:gap-16 sm:px-6 sm:pb-24">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <header className="flex flex-col items-center gap-6 text-center">
        <h1 className="flex w-full justify-center">
          <span className="sr-only">ViraStack Start</span>
          <BrandLockup className="w-[85.2vw] overflow-visible sm:w-[521px] lg:w-[601px]" />
        </h1>
        <p className="text-balance text-muted-foreground">{siteConfig.description}</p>
        {DEMO_PATH && (
          <a href={DEMO_PATH} className={buttonVariants({ size: "lg", className: "group" })}>
            See the stack working
            <ArrowRightIcon
              aria-hidden
              className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </a>
        )}
      </header>

      <section aria-labelledby="next-steps-heading" className="flex flex-col gap-3">
        <h2 id="next-steps-heading" className="font-semibold">
          Next steps
        </h2>
        <ol className="flex flex-col gap-3">
          {NEXT_STEPS.map(({ title, path }) => (
            <li
              key={title}
              className="flex flex-col gap-1 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              {title}
              <code className="font-mono text-xs break-all text-muted-foreground">{path}</code>
            </li>
          ))}
        </ol>
      </section>

      <StackList />

      <nav aria-label="Project links" className="flex flex-wrap justify-center gap-2">
        {RESOURCE_LINKS.map(({ label, href }) => (
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
