import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";

type HeaderLink = {
  label: string;
  href: string;
};

type HeaderProps = {
  /** Optional nav links (e.g. landing anchors). Omit for a chrome-only header. */
  links?: readonly HeaderLink[];
};

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function Header({ links = [] }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 tracking-tight">
          <Image
            src="/logo.webp"
            alt="ViraStack Logo"
            width={24}
            height={24}
            className="h-6 w-6"
            sizes="24px"
          />
          <span className="text-lg">
            <span className="font-black text-primary">ViraStack</span>{" "}
            <span className="font-medium text-teal-500 italic">Start</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              nativeButton={false}
              render={
                <Link href="https://github.com/virastack/" target="_blank" rel="noreferrer" />
              }
              className="size-8"
              aria-label="GitHub"
            >
              <GitHubIcon className="size-3.5" />
            </Button>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
