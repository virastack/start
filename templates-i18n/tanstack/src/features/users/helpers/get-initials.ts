/** Pass the locale: Turkish capitalises "i" as "İ", and server and browser defaults can differ. */
export function getInitials(name: string, locale?: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  const last = parts[parts.length - 1]

  if (!first) {
    return "?"
  }

  if (!last || parts.length === 1) {
    return first.charAt(0).toLocaleUpperCase(locale)
  }

  return `${first.charAt(0)}${last.charAt(0)}`.toLocaleUpperCase(locale)
}
