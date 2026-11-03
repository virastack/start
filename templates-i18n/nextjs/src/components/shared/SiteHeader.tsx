import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export function SiteHeader() {
  return (
    <header>
      <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-2 px-4 py-4 sm:px-6">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  )
}
