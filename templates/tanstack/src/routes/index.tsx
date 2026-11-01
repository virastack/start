import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

import { Pending } from "@/components/shared/Pending"
import { HomePage } from "@/features/home/components/HomePage"

export const Route = createFileRoute("/")({
  head: () => ({ links: [{ rel: "canonical", href: siteConfig.url }] }),
  pendingComponent: Pending,
  component: Home
})

function Home() {
  return <HomePage />
}
