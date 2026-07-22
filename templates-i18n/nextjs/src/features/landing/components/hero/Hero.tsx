import Link from "next/link";

import { Github } from "lucide-react";
import { Balancer } from "react-wrap-balancer";

import { Button } from "@/ui";

type HeroProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  githubUrl: string;
  githubLabel: string;
};

export function Hero({ title, description, githubUrl, githubLabel }: HeroProps) {
  return (
    <div className="mt-20 flex flex-col items-center justify-center gap-6">
      <Balancer
        as="h1"
        className="text-center text-2xl font-bold text-black lg:text-5xl dark:text-white"
      >
        {title}
      </Balancer>

      <Balancer as="div">
        <p className="max-w-3xl px-3 text-center text-base">{description}</p>
      </Balancer>

      <Button asChild>
        <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
          <Github className="h-4 w-4" aria-hidden="true" />
          {githubLabel}
        </Link>
      </Button>
    </div>
  );
}
