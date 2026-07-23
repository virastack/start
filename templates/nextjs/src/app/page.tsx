import { Footer, Header } from "@/components/layout";
import { Features, Hero, Showcase } from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Showcase />
      </main>
      <Footer />
    </>
  );
}
