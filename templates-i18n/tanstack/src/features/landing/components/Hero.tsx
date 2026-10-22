import { siteConfig } from "@/config/site.config";

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/features/landing/components/Reveal";
import { ReactIcon, TailwindIcon, TanstackIcon } from "@/features/landing/icons";
import * as m from "@/paraglide/messages.js";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-24 pb-16 text-center">
      <Reveal mode="mount" delay={0} y={-8}>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          {m.hero_badge()}
        </span>
      </Reveal>

      <h1 className="mb-2 text-center text-4xl lg:text-6xl">
        <span className="font-black text-primary">{m.hero_title_1()}</span>{" "}
        <span className="font-medium text-teal-500 italic">{m.hero_title_2()}</span>
        <span className="mt-2 block text-lg font-normal text-muted-foreground lg:text-xl">
          TanStack Edition
        </span>
      </h1>

      <p className="max-w-2xl text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
        {m.hero_desc_1()}
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <TanstackIcon className="h-4 w-4" />
          TanStack Start
        </span>
        {m.hero_desc_2()}
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <ReactIcon className="h-4 w-4" />
          React 19
        </span>
        {m.hero_desc_3()}
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <TailwindIcon className="h-4 w-4" />
          Tailwind CSS 4
        </span>
        {m.hero_desc_4()}
        <span className="font-medium text-foreground italic">Zustand</span>
        {m.hero_desc_5()}
        <span className="font-medium text-foreground italic">TanStack Query</span>
        {m.hero_desc_6()}
        <span className="font-medium text-foreground italic">React Hook Form</span>
        {m.hero_desc_7()}
      </p>

      <Reveal mode="mount" delay={0.1} className="mt-2 flex items-center gap-2">
        <Button
          nativeButton={false}
          render={<a href={siteConfig.links.github} target="_blank" rel="noreferrer" />}
        >
          <span>⭐</span>
          <span>{m.github()}</span>
        </Button>
        <LanguageSwitcher />
        <div className="h-9 w-9 [&>button]:h-full [&>button]:w-full">
          <ThemeToggle />
        </div>
      </Reveal>
    </section>
  );
}
