import * as m from "@/paraglide/messages.js"
import { assertIsLocale, getLocale, setLocale } from "@/paraglide/runtime.js"

export function LanguageSwitcher() {
  const currentLang = getLocale()

  // setLocale loads the localized URL as a new document, so the server HTML and the URL agree.
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    void setLocale(assertIsLocale(e.target.value))
  }

  return (
    <div className="relative">
      <select
        aria-label={m.language()}
        value={currentLang}
        onChange={onChange}
        className="h-8 cursor-pointer appearance-none rounded-md border border-input bg-background pr-8 pl-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50"
      >
        <option value="en">EN</option>
        <option value="tr">TR</option>
      </select>
      <div className="pointer-events-none absolute top-2 right-2.5 h-4 w-4 text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  )
}
