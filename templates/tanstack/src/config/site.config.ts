import type { SiteConfig } from "@/types/site-config.types";
import { env } from "@/env";

// FIXME: replace with your own site metadata.
export const siteConfig: SiteConfig = {
  name: env.VITE_APP_NAME,
  description:
    "TanStack Start boilerplate built for scalable UI/UX, clean architecture, and agent-ready developer experience.",
  url: env.VITE_APP_URL,
  ogImage: `${env.VITE_APP_URL}/og.png`,
  links: {
    github: "https://github.com/virastack/start",
    twitter: "https://x.com/virastack",
  },
};
