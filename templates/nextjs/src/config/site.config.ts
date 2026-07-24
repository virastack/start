import type { SiteConfig } from "@/types/site-config.types";
import { env } from "@/env";

// FIXME: replace with your own site metadata.
export const siteConfig: SiteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description:
    "Premium Next.js boilerplate built for scalable UI/UX, clean architecture, and agent-ready developer experience.",
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.png`,
  links: {
    github: "https://github.com/virastack/start",
    twitter: "https://x.com/virastack",
  },
};
