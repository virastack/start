"use client";

import Link from "next/link";

import { GitBranch, Github, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { Balancer } from "react-wrap-balancer";

import { env } from "@/env";

import { Button } from "@/ui";
import { StackList } from "@/features/landing";
import { stackData } from "@/features/landing/data/stack-data";

export function Dashboard() {
  const t = useTranslations("Dashboard");

  return (
    <section className="container py-16">
      <div className="flex flex-col items-center justify-center gap-6">
        <Balancer
          as="h1"
          className="text-center text-2xl font-bold text-black lg:text-5xl dark:text-white"
        >
          {t("title")}
        </Balancer>

        <Balancer as="p" className="max-w-3xl px-3 text-center text-base">
          {t.rich("description", {
            react: (chunks) => <strong className="font-semibold">{chunks}</strong>,
            typescript: (chunks) => <strong className="font-semibold">{chunks}</strong>,
            tailwind: (chunks) => <strong className="font-semibold">{chunks}</strong>,
            tanstack: (chunks) => <strong className="font-semibold">{chunks}</strong>
          })}
        </Balancer>

        <Button asChild>
          <Link href={env.NEXT_PUBLIC_GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" aria-hidden="true" />
            {t("starOnGithub")}
          </Link>
        </Button>
      </div>

      <StackList data={stackData} />

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link
            href="https://vercel.com/new/clone?repository-url=https://github.com/virastack/nextjs-boilerplate"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Rocket className="h-4 w-4" aria-hidden="true" />
            {t("deployToVercel")}
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link
            href="https://github.com/virastack/nextjs-boilerplate/generate"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitBranch className="h-4 w-4" aria-hidden="true" />
            {t("useTemplate")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
