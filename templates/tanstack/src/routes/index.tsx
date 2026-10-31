import { createFileRoute } from "@tanstack/react-router"

import { Pending } from "@/components/shared/Pending"
import { LandingPage } from "@/features/landing"

export const Route = createFileRoute("/")({
  pendingComponent: Pending,
  component: Home
})

function Home() {
  return <LandingPage />
}
