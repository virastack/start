"use client";

import Link from "next/link";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/ui";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");
  const locale = useLocale();
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">{t("title")}</h2>
      <p className="text-muted-foreground">
        {t("message")}
        {isDev && error?.message && (
          <span className="mt-2 block text-sm text-muted-foreground/80">{error.message}</span>
        )}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>{t("retry")}</Button>
        <Button asChild variant="outline">
          <Link href={`/${locale}`}>{t("goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
