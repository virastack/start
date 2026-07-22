import { DEFAULT_LOCALE, LOCALES, type LocaleCode } from "@/constants/i18n.constants";

export const isLocaleCode = (code: string): code is LocaleCode => {
  return code in LOCALES;
};

export const getLocaleLabel = (
  code: string,
  displayLocale: LocaleCode = DEFAULT_LOCALE
): string => {
  if (isLocaleCode(code)) {
    return LOCALES[code].label;
  }

  try {
    const intl = new Intl.DisplayNames([displayLocale], { type: "language" });
    return intl.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};
