import { createFileRoute } from "@tanstack/react-router"

import { Pending } from "@/components/shared/Pending"
import { HomePage } from "@/features/home/components/HomePage"

export const Route = createFileRoute("/")({
  pendingComponent: Pending,
  component: Home
})

function Home() {
  return <HomePage />
}
