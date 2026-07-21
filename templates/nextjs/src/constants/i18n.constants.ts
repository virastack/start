// FIXME: Customize supported locales (labels, tags, flags) and default locale
export const LOCALES = {
  tr: { label: "Türkçe", tag: "tr-TR", flag: "🇹🇷" },
  en: { label: "English", tag: "en-US", flag: "🇬🇧" }
} as const;

export type LocaleCode = keyof typeof LOCALES;

// FIXME: Set your project's default locale code
export const DEFAULT_LOCALE: LocaleCode = "en";

export const SUPPORTED_LOCALES = Object.keys(LOCALES) as LocaleCode[];

export const LOCALE_TAGS = Object.fromEntries(
  SUPPORTED_LOCALES.map((code) => [code, LOCALES[code].tag])
) as Record<LocaleCode, string>;
