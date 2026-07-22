"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";

export function IntlProvider({
  children,
  messages,
  locale
}: {
  children: React.ReactNode;
  messages: AbstractIntlMessages;
  locale?: string;
}) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale} timeZone="Europe/Istanbul">
      {children}
    </NextIntlClientProvider>
  );
}
