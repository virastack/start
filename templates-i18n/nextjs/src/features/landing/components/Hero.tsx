import Link from "next/link";

import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site.config";

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/features/landing/components/Reveal";
import { NextjsIcon, ReactIcon, TailwindIcon } from "@/features/landing/icons";

export function Hero() {
  const t = useTranslations("Index");

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-24 pb-16 text-center">
      <Reveal mode="mount" delay={0} y={-8}>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          {t("hero_badge")}
        </span>
      </Reveal>

      <h1 className="mb-2 text-center text-4xl lg:text-6xl">
        <span className="font-black text-primary">{t("hero_title_1")}</span>{" "}
        <span className="font-medium text-teal-500 italic">{t("hero_title_2")}</span>
        <span className="mt-2 block text-lg font-normal text-muted-foreground lg:text-xl">
          Next.js Edition
        </span>
      </h1>

      <p className="max-w-2xl text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
        {t.rich("hero_desc", {
          nextjs: (chunks) => (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <NextjsIcon className="h-4 w-4" />
              {chunks}
            </span>
          ),
          react: (chunks) => (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <ReactIcon className="h-4 w-4" />
              {chunks}
            </span>
          ),
          tailwind: (chunks) => (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <TailwindIcon className="h-4 w-4" />
              {chunks}
            </span>
          ),
          zustand: (chunks) => <span className="font-medium text-foreground italic">{chunks}</span>,
          tanstack: (chunks) => (
            <span className="font-medium text-foreground italic">{chunks}</span>
          ),
          rhf: (chunks) => <span className="font-medium text-foreground italic">{chunks}</span>,
        })}
      </p>

      <Reveal mode="mount" delay={0.1} className="mt-2 flex items-center gap-2">
        <Button
          nativeButton={false}
          render={<Link href={siteConfig.links.github} target="_blank" rel="noreferrer" />}
        >
          <span>⭐</span>
          <span>{t("github")}</span>
        </Button>
        <LanguageSwitcher />
        <div className="h-9 w-9 [&>button]:h-full [&>button]:w-full">
          <ThemeToggle />
        </div>
      </Reveal>
    </section>
  );
}
