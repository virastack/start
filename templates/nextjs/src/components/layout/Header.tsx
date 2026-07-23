import Image from "next/image";
import Link from "next/link";

import { NAV_LINKS } from "@/constants";
import { siteConfig } from "@/config/site.config";

import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 tracking-tight">
          <Image src="/logo.png" alt="ViraStack Logo" width={24} height={24} className="h-6 w-6" />
          <span className="text-lg">
            <span className="font-black text-primary">ViraStack</span>{" "}
            <span className="font-medium text-teal-500 italic">Start</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
