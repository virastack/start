import { RevealGroup, RevealItem } from "@/features/landing/components/Reveal"
import { featureCardClassName } from "@/features/landing/helpers"
import {
  ReactHookFormIcon,
  TailwindIcon,
  TanstackIcon,
  TypescriptIcon
} from "@/features/landing/icons"
import * as m from "@/paraglide/messages.js"

export function Features() {
  const FEATURES = [
    {
      title: m.feature_1_title(),
      description: m.feature_1_desc(),
      icon: <TanstackIcon className="size-7 text-primary" />
    },
    {
      title: m.feature_2_title(),
      description: m.feature_2_desc(),
      icon: <TypescriptIcon className="size-7 text-primary" />
    },
    {
      title: m.feature_3_title(),
      description: m.feature_3_desc(),
      icon: <TanstackIcon className="size-7 text-primary" />
    },
    {
      title: m.feature_4_title(),
      description: m.feature_4_desc(),
      icon: <TailwindIcon className="size-7 text-primary" />
    },
    {
      title: m.feature_5_title(),
      description: m.feature_5_desc(),
      icon: <ReactHookFormIcon className="size-7 text-primary" />
    },
    {
      title: m.feature_6_title(),
      description: m.feature_6_desc(),
      icon: <img src="/logo.webp" alt="ViraStack Logo" className="size-7" />
    }
  ]

  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-16">
      <RevealGroup className="mb-16 text-center">
        <RevealItem>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            {m.features_title()}
          </h2>
        </RevealItem>
        <RevealItem>
          <p className="mx-auto mt-3 max-w-xl text-base text-balance text-muted-foreground">
            {m.features_subtitle()}
          </p>
        </RevealItem>
      </RevealGroup>

      <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <RevealItem key={feature.title} className={featureCardClassName}>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 ease-out group-hover:scale-105">
              {feature.icon}
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-balance text-foreground md:text-lg">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}
