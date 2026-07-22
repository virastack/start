"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

import { DEFAULT_LOCALE, LOCALES, SUPPORTED_LOCALES } from "@/constants/i18n.constants";

import { usePathname, useRouter } from "@/i18n/navigation";
import { getLocaleLabel, isLocaleCode } from "@/lib/locale";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/ui";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const activeLocale = isLocaleCode(currentLocale) ? currentLocale : DEFAULT_LOCALE;

  if (SUPPORTED_LOCALES.length <= 1) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Change language">
            <Globe className="size-4" />
            <span className="sr-only">Change language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {SUPPORTED_LOCALES.map((code) => (
            <DropdownMenuItem
              key={code}
              disabled={code === activeLocale}
              onClick={() => router.replace(pathname, { locale: code })}
            >
              <span>{LOCALES[code]?.flag ?? "🏳️"}</span>
              {getLocaleLabel(code, activeLocale)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
