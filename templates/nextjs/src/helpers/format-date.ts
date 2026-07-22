/**
 * Formats a date using `Intl.DateTimeFormat`. Kept dependency-free on purpose —
 * add `date-fns` only if you need heavier date arithmetic.
 */
export function formatDate(date: Date | string, locale = "en-US") {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}
