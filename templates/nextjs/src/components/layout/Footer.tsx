import { siteConfig } from "@/config/site.config";

import { formatDate } from "@/helpers";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. MIT Licensed.
        </p>
        <p>Last built on {formatDate(new Date())}.</p>
      </div>
    </footer>
  );
}
