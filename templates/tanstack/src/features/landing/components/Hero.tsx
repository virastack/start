import { siteConfig } from "@/config/site.config";

import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/features/landing/components/Reveal";
import { ReactIcon, TailwindIcon, TanstackIcon } from "@/features/landing/icons";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-24 pb-16 text-center">
      <Reveal mode="mount" delay={0} y={-8}>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          UI/UX · Agent-ready · Zero bloat
        </span>
      </Reveal>

      <h1 className="mb-2 text-center text-4xl lg:text-6xl">
        <span className="font-black text-primary">ViraStack</span>{" "}
        <span className="font-medium text-teal-500 italic">Start</span>
        <span className="mt-2 block text-lg font-normal text-muted-foreground lg:text-xl">
          TanStack Edition
        </span>
      </h1>

      <p className="max-w-2xl text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
        Built with{" "}
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <TanstackIcon className="h-4 w-4" />
          TanStack Start
        </span>
        ,{" "}
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <ReactIcon className="h-4 w-4" />
          React 19
        </span>
        , and{" "}
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <TailwindIcon className="h-4 w-4" />
          Tailwind CSS 4
        </span>{" "}
        - wired together with <span className="font-medium text-foreground italic">
          Zustand
        </span>, <span className="font-medium text-foreground italic">TanStack Query</span>, and{" "}
        <span className="font-medium text-foreground italic">React Hook Form</span> so you can ship
        a polished product from day one.
      </p>

      <Reveal mode="mount" delay={0.1} className="mt-2 flex items-center gap-2">
        <Button
          className="h-10 px-4 py-2"
          nativeButton={false}
          render={<a href={siteConfig.links.github} target="_blank" rel="noreferrer" />}
        >
          <span>⭐</span>
          <span>Star on GitHub</span>
        </Button>
        <div className="h-10 w-10 [&>button]:h-full [&>button]:w-full">
          <ThemeToggle />
        </div>
      </Reveal>
    </section>
  );
}
