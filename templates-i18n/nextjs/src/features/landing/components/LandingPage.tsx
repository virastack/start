import { Features } from "@/features/landing/components/Features"
import { Hero } from "@/features/landing/components/Hero"
import { Showcase } from "@/features/landing/components/Showcase"

/**
 * Demo landing surface. Delete `src/features/landing` and replace
 * `src/app/page.tsx` when you start your own product UI.
 */
export function LandingPage() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <Showcase />
    </main>
  )
}
