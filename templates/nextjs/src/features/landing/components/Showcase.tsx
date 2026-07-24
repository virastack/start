import { CartDemo } from "@/features/landing/components/CartDemo";
import { ProjectFormDemo } from "@/features/landing/components/ProjectFormDemo";
import { RevealGroup, RevealItem } from "@/features/landing/components/Reveal";
import { UsersDemo } from "@/features/landing/components/UsersDemo";
import { featureCardClassName } from "@/features/landing/helpers";

export function Showcase() {
  return (
    <section id="showcase" className="mx-auto max-w-5xl px-6 pb-16">
      <RevealGroup className="mb-10 text-center">
        <RevealItem>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">Showcase</h2>
        </RevealItem>
        <RevealItem>
          <p className="mx-auto mt-3 max-w-2xl text-base text-balance text-muted-foreground">
            Experience the seamless integration of UI components and state management.
          </p>
        </RevealItem>
      </RevealGroup>

      <RevealGroup className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <RevealItem className={`${featureCardClassName} h-full min-h-0 [&>*]:min-h-0 [&>*]:flex-1`}>
          <UsersDemo />
        </RevealItem>

        <div className="flex flex-col gap-6">
          <RevealItem className={featureCardClassName}>
            <div className="mb-4">
              <h4 className="text-base font-semibold text-foreground md:text-lg">New Project</h4>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                Validated forms with{" "}
                <span className="font-semibold text-foreground">React Hook Form</span> and{" "}
                <span className="font-semibold text-foreground">Zod</span>.
              </p>
            </div>
            <ProjectFormDemo />
          </RevealItem>

          <RevealItem className={`${featureCardClassName} flex flex-col`}>
            <div>
              <h4 className="text-base font-semibold text-foreground md:text-lg">Global State</h4>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                Shared client state managed with{" "}
                <span className="font-semibold text-foreground">Zustand</span>.
              </p>
            </div>
            <CartDemo />
          </RevealItem>
        </div>
      </RevealGroup>
    </section>
  );
}
