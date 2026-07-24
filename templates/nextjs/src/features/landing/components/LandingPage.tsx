import { Footer, Header } from "@/components/layout";
import { Features } from "@/features/landing/components/Features";
import { Hero } from "@/features/landing/components/Hero";
import { Showcase } from "@/features/landing/components/Showcase";
import { NAV_LINKS } from "@/features/landing/constants";

/**
 * Demo landing surface. Delete `src/features/landing` and replace
 * `src/app/page.tsx` when you start your own product UI.
 */
export function LandingPage() {
  return (
    <>
      <Header links={NAV_LINKS} />
      <main className="flex-1">
        <Hero />
        <Features />
        <Showcase />
      </main>
      <Footer />
    </>
  );
}
