import Link from "next/link";

import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/features/landing/components/Reveal";
import { NextjsIcon, ReactIcon, TailwindIcon } from "@/features/landing/icons";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-24 pb-16 text-center">
      <Reveal mode="mount" delay={0} y={-8}>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          Premium UI/UX · Agent-ready · Zero bloat
        </span>
      </Reveal>

      <h1 className="mb-2 text-center text-4xl lg:text-6xl">
        <span className="font-black text-primary">ViraStack</span>{" "}
        <span className="font-medium text-teal-500 italic">Start</span>
      </h1>

      <p className="max-w-2xl text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
        Built with{" "}
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <NextjsIcon className="h-4 w-4" />
          Next.js 16
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

      <Reveal
        mode="mount"
        delay={0.1}
        className="mt-2 flex flex-wrap items-center justify-center gap-3"
      >
        <Button
          nativeButton={false}
          render={
            <Link
              href="https://github.com/virastack/nextjs-boilerplate#getting-started"
              target="_blank"
            />
          }
          className="group"
        >
          Quick start
          <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>

        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="https://github.com/virastack/nextjs-boilerplate" target="_blank" />}
          className="gap-2"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Star on GitHub
        </Button>
      </Reveal>
    </section>
  );
}
