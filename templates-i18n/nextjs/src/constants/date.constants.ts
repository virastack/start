import type { Locale } from "date-fns";
import { enUS, tr } from "date-fns/locale";

import { DEFAULT_LOCALE, type LocaleCode } from "@/constants/i18n.constants";

import { isLocaleCode } from "@/lib/locale";

export const normalizeLocale = (loc?: string): LocaleCode => {
  const base = (loc ?? DEFAULT_LOCALE).split("-")[0];
  return isLocaleCode(base) ? base : DEFAULT_LOCALE;
};

export const DATEFNS_LOCALES: Partial<Record<LocaleCode, Locale>> = {
  en: enUS,
  tr
};

export const getDateFnsLocale = (code?: string): Locale => {
  const normalized = normalizeLocale(code);
  return DATEFNS_LOCALES[normalized] ?? enUS;
};

export const DATE_PATTERN = {
  DATE: "PPP",
  DATE_TIME: "PPpp",
  TIME: "p"
} as const;
