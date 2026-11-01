import type { ReactNode } from "react"

import { ArrowLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

type UsersPageProps = {
  children: ReactNode
}

/** The page frame. The route passes the list in, so the header shows while it loads. */
export function UsersPage({ children }: UsersPageProps) {
  const t = useTranslations("Users")

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pb-6 sm:px-6 sm:pb-10">
      <div>
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeftIcon aria-hidden />
          {t("back_to_start")}
        </Link>
      </div>
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-pretty text-muted-foreground">{t("subtitle")}</p>
        </div>
      </header>
      {children}
      <footer className="flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground">
        <GuideRow label={t("guide_source")} items={["src/features/users"]} />
        <GuideRow
          label={t("guide_api")}
          items={["NEXT_PUBLIC_API_URL", "api/", "schemas/", "AddUserForm"]}
        />
        <GuideRow label={t("guide_remove")} items={["npx virastack remove users"]} />
      </footer>
    </main>
  )
}

function GuideRow({ label, items }: { label: string; items: string[] }) {
  return (
    <p className="flex flex-wrap items-center gap-1.5">
      {label}
      {items.map((item) => (
        <code key={item} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs break-all">
          {item}
        </code>
      ))}
    </p>
  )
}
