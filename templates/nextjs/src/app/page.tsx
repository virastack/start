import { Footer, Header } from "@/components/layout";
import { Hero, Playground } from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Playground />
      </main>
      <Footer />
    </>
  );
}
