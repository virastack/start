import {
  format,
  formatDistanceToNowStrict,
  isToday as isTodayFn,
  isValid,
  parseISO
} from "date-fns";

import { DATE_PATTERN, DATEFNS_LOCALES, normalizeLocale } from "@/constants/date.constants";

export const parseDate = (value?: string | null) => {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
};

const toDate = (v: Date | string | null | undefined) => {
  if (!v) return null;
  if (v instanceof Date) return isValid(v) ? v : null;
  return parseDate(v);
};

export const formatDate = (date: Date | string, locale?: string, pattern = DATE_PATTERN.DATE) => {
  const d = toDate(date);
  if (!d) return "-";
  const loc = DATEFNS_LOCALES[normalizeLocale(locale)];
  return format(d, pattern, { locale: loc });
};

export const timeAgo = (date: Date | string, locale?: string) => {
  const d = toDate(date);
  if (!d) return "-";
  const loc = DATEFNS_LOCALES[normalizeLocale(locale)];
  return formatDistanceToNowStrict(d, { addSuffix: true, locale: loc });
};

export const isToday = (date: Date | string) => {
  const d = toDate(date);
  return d ? isTodayFn(d) : false;
};
