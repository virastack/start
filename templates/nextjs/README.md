<div align="center">

# ViraStack Start (Next.js)

**The Next.js boilerplate that feels effortless.**

Next.js 16 · React 19 · Tailwind CSS 4 · Base UI · TypeScript strict · Agent-ready

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.9-339933?logo=node.js&logoColor=white)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-10.19-F69220?logo=pnpm&logoColor=white)](package.json)

</div>

---

A production-grade starting point for Next.js apps — opinionated where it matters (architecture, types, DX) and unopinionated where it shouldn't be (styling is 100% yours via Tailwind + design tokens). Built for teams and AI coding agents to move fast without accumulating debt.

## Table of contents

- [Why this boilerplate](#why-this-boilerplate)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Import aliases](#import-aliases)
- [Environment variables](#environment-variables)
- [Styling & design tokens](#styling--design-tokens)
- [State management](#state-management)
- [Data fetching](#data-fetching)
- [Forms & validation](#forms--validation)
- [UI components (Base UI)](#ui-components-base-ui)
- [Quality gates](#quality-gates)
- [Git hooks](#git-hooks)
- [CI/CD](#cicd)
- [Versioning & releases](#versioning--releases)
- [ViraStack AI](#virastack-ai)
- [SEO](#seo)
- [Deployment](#deployment)
- [FAQ](#faq)

## Why this boilerplate

Most Next.js starters either ship too little (just the framework defaults) or too much (opinionated UI kits you have to fight). This one gives you:

- **A real architecture** — feature-sliced folders (`features/`, `components/`, `hooks/`, `stores/`, `schemas/`) instead of a single `components` dump.
- **A fully-typed foundation** — `strict` + `noUncheckedIndexedAccess` TypeScript, Zod-validated env vars, typed API errors.
- **Unstyled-first UI** — [Base UI](https://base-ui.com) primitives styled with Tailwind CSS 4 + CVA, so you own every pixel.
- **Zero mystery state** — Zustand for client state, TanStack Query for server state, `nuqs` for URL state. No prop-drilling, no global grab-bag.
- **Agent-ready by default** — ViraStack AI layer: Cursor rules, `AGENTS.md`, `llms.txt`, and curated agent skills so AI coding agents produce code that matches the codebase's conventions instead of inventing their own.
- **CI-enforced quality** — lint, typecheck, dead-code detection, and build all run on every push and are enforced locally via git hooks before they ever reach CI.

## Tech stack

| Layer               | Choice                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Framework           | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)                                     |
| UI runtime          | [React 19](https://react.dev/) + React Compiler                                               |
| Styling             | [Tailwind CSS 4](https://tailwindcss.com/) + shadcn-style CSS variable tokens                 |
| Components          | [Base UI](https://base-ui.com/) (unstyled, accessible primitives) + [CVA](https://cva.style/) |
| Animation           | [Framer Motion](https://motion.dev/)                                                          |
| Icons               | [Lucide React](https://lucide.dev/)                                                           |
| Notifications       | [Sonner](https://sonner.emilkowal.ski/)                                                       |
| Theming             | [next-themes](https://github.com/pacocoursey/next-themes)                                     |
| Client state        | [Zustand](https://zustand.docs.pmnd.rs/)                                                      |
| Server state        | [TanStack Query v5](https://tanstack.com/query)                                               |
| URL state           | [nuqs](https://nuqs.47ng.com/)                                                                |
| Forms               | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                     |
| HTTP                | Native `fetch` + a typed wrapper (no Axios)                                                   |
| Linting/formatting  | ESLint 9 (flat config) + Prettier 3                                                           |
| Dead-code detection | [Knip](https://knip.dev/)                                                                     |
| Git hooks           | Husky + lint-staged + Commitlint                                                              |
| Versioning          | [Changesets](https://github.com/changesets/changesets)                                        |
| CI                  | GitHub Actions                                                                                |
| Package manager     | [pnpm](https://pnpm.io/)                                                                      |

## Getting started

**Prerequisites:** Node.js `>=20.9`, pnpm `10.x` (enforced via `packageManager`).

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The home page is a live playground demoing every part of the stack (theme toggle, Base UI dialog/tabs, Zustand counter, TanStack Query fetch, Zod-validated form).

## Scripts

| Script                   | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `pnpm dev`               | Start the dev server (Turbopack)                    |
| `pnpm build`             | Production build                                    |
| `pnpm start`             | Serve the production build                          |
| `pnpm analyze`           | Build with the bundle analyzer enabled              |
| `pnpm clean`             | Remove the `.next` build output                     |
| `pnpm lint`              | Lint with ESLint                                    |
| `pnpm lint:fix`          | Lint + auto-fix + format                            |
| `pnpm lint:ci`           | Lint with zero warnings + format check (used in CI) |
| `pnpm format`            | Format all files with Prettier                      |
| `pnpm format:check`      | Check formatting without writing                    |
| `pnpm typecheck`         | Type-check with `tsc --noEmit`                      |
| `pnpm knip`              | Find unused files, exports, and dependencies        |
| `pnpm changeset`         | Record a changeset for your next release            |
| `pnpm changeset:version` | Bump versions from pending changesets               |
| `pnpm changeset:publish` | Publish a new version                               |

## Project structure

```
src/
├── app/                  # Next.js App Router (routes, layouts, metadata)
│   ├── layout.tsx        # Root layout — fonts, Providers, nuqs adapter
│   ├── page.tsx          # Home page
│   ├── loading.tsx       # Route-level loading UI
│   ├── error.tsx         # Route-level error boundary
│   ├── global-error.tsx  # Root error boundary
│   ├── not-found.tsx     # 404 page
│   ├── sitemap.ts        # Sitemap generation
│   └── robots.ts         # robots.txt generation
├── features/             # Feature slices (self-contained UI + logic)
│   └── landing/          # Example: Hero, Playground, demo components
├── components/
│   ├── ui/               # Base UI wrappers (Button, Input, Dialog, Tabs, …)
│   ├── layout/            # Header, Footer
│   └── shared/            # Cross-feature components (ThemeToggle, …)
├── hooks/                # Reusable hooks (TanStack Query hooks, etc.)
├── stores/               # Zustand stores
├── schemas/              # Zod schemas (forms, API payloads)
├── providers/            # ThemeProvider, QueryProvider, Providers (composed)
├── lib/                  # utils (cn), api.ts (fetch wrapper), query-client.ts
├── config/               # site.config.ts, seo.config.ts
├── constants/            # App-wide constants (nav links, etc.)
├── data/                 # Static/typed data used by demos
├── helpers/              # Small pure utility functions (formatDate, …)
├── types/                # Shared TypeScript types
├── styles/               # tailwind.css — design tokens & global styles
└── env.ts                # Zod-validated, type-safe environment variables
```

Each folder that's imported via a short alias (see below) has an `index.ts` barrel — this keeps import paths short and lets Knip correctly identify unused exports.

## Import aliases

Defined in `tsconfig.json`:

| Alias       | Resolves to             |
| ----------- | ----------------------- |
| `@/*`       | `src/*`                 |
| `@/ui`      | `src/components/ui`     |
| `@/layout`  | `src/components/layout` |
| `@/hooks`   | `src/hooks`             |
| `@/data`    | `src/data`              |
| `@/schemas` | `src/schemas`           |

```ts
import { newsletterSchema } from "@/schemas";

import { useUsers } from "@/hooks";

import { Button, Dialog } from "@/ui";
```

## Environment variables

Environment variables are validated at startup with Zod in [`src/env.ts`](src/env.ts) — the app fails fast with a clear error instead of silently reading `undefined`. Client-exposed variables must be prefixed with `NEXT_PUBLIC_`.

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="ViraStack"
```

Import the validated, typed object anywhere instead of touching `process.env` directly:

```ts
import { env } from "@/env";

env.NEXT_PUBLIC_APP_URL; // string, guaranteed valid
```

## Styling & design tokens

Tailwind CSS 4 is configured CSS-first in [`src/styles/tailwind.css`](src/styles/tailwind.css) using shadcn-style CSS variables (`--background`, `--foreground`, `--primary`, `--radius`, …) so the entire palette can be re-themed by editing one file. Dark mode is a `.dark` class toggled by `next-themes`, with no flash-of-wrong-theme thanks to `suppressHydrationWarning` + the theme script injected by `ThemeProvider`.

```ts
import { cn } from "@/lib/utils";

<div className={cn("rounded-md border", isActive && "border-primary")} />
```

## State management

Three kinds of state, three dedicated tools — no mixing:

- **Client state** (`src/stores/`) — Zustand. See `counter.store.ts` for the pattern.
- **Server state** (`src/hooks/`) — TanStack Query. See `use-users.ts`; queries are cached, deduped, and retried automatically via the shared `QueryClient` in `src/lib/query-client.ts`.
- **URL state** — `nuqs`. See `Playground.tsx`'s tab state — it's shareable, bookmarkable, and survives a refresh.

## Data fetching

No Axios — a ~60-line native `fetch` wrapper in [`src/lib/api.ts`](src/lib/api.ts) provides:

- Automatic JSON parsing & `Content-Type` headers
- A typed `ApiError` (with `status` and `data`) thrown on non-2xx responses
- Lightweight retry support
- `api.get/post/put/patch/delete` helpers

```ts
import { api, ApiError } from "@/lib/api";

try {
  const users = await api.get<User[]>("/users");
} catch (error) {
  if (error instanceof ApiError) {
    // error.status, error.data
  }
}
```

Pair it with TanStack Query hooks for caching, loading, and error states out of the box.

## Forms & validation

React Hook Form + Zod, wired through `@hookform/resolvers`. Because Base UI's `Input` is a controlled `Field.Control` rather than a plain `<input>`, form fields use RHF's `Controller` (not `register()`) to keep value/onChange/ref in sync — see [`src/features/landing/NewsletterForm.tsx`](src/features/landing/NewsletterForm.tsx) for the reference implementation. Forms set `noValidate` so Zod (not the browser) owns 100% of the validation UX.

```tsx
const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(newsletterSchema),
});

<Controller
  control={control}
  name="email"
  render={({ field }) => <Input {...field} aria-invalid={!!errors.email} />}
/>;
```

## UI components (Base UI)

`src/components/ui/` wraps [Base UI](https://base-ui.com) primitives with Tailwind + CVA variants — Base UI ships zero styles by design, so every component here is fully yours to restyle. Two Base UI specifics worth knowing:

- **`render` prop** — polymorphic rendering (e.g. render a `Button` as a `next/link`).
- **`nativeButton={false}`** — required whenever a `Button` renders as something other than a native `<button>` (a link, a `DialogTrigger`, etc.), or Base UI logs a console warning.

```tsx
<Button render={<Link href="/docs" />} nativeButton={false}>
  Read the docs
</Button>
```

## Quality gates

| Tool                       | Purpose                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **ESLint 9** (flat config) | `eslint-config-next` + `no-unused-vars` + `no-console`                                                                                |
| **Prettier 3**             | Formatting, with `@ianvs/prettier-plugin-sort-imports` (deterministic import order) and `prettier-plugin-tailwindcss` (class sorting) |
| **TypeScript**             | `strict: true`, `noUncheckedIndexedAccess: true` — no implicit `any`, no silently-undefined array/object access                       |
| **Knip**                   | Flags unused files, exports, and dependencies (`pnpm knip`)                                                                           |

Run everything at once before pushing:

```bash
pnpm lint:ci && pnpm typecheck && pnpm knip && pnpm build
```

## Git hooks

Configured via Husky and run automatically:

- **`pre-commit`** — `lint-staged` (ESLint + Prettier on staged files only)
- **`commit-msg`** — Commitlint, enforcing [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, …)
- **`pre-push`** — `typecheck` + `lint:ci`, so broken code never reaches the remote

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and pull request: install → lint → typecheck → knip → build. All four must pass before merging.

## Versioning & releases

This boilerplate is versioned with [Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset          # describe your change
pnpm changeset:version  # bump package.json + write CHANGELOG.md
pnpm changeset:publish  # publish
```

## ViraStack AI

A pre-configured context layer so AI coding agents produce code that matches this codebase — not generic boilerplate.

| File | Purpose | Works with |
| :--- | :--- | :--- |
| `AGENTS.md` | Agent operating guide | All agents |
| `CLAUDE.md` | Claude Code entry point | Claude Code |
| `.cursor/rules/` | Scoped coding rules | Cursor (auto), others (via `AGENTS.md`) |
| `public/llms.txt` | Machine-readable project summary | All agents |
| `.agents/skills/` | Design-taste skills (`emil-design-eng`, `make-interfaces-feel-better`) | Cursor, Claude Code |

Install or update rules via [`@virastack/ai`](https://www.npmjs.com/package/@virastack/ai):

```bash
npx @virastack/ai init
```

## SEO

- Centralized metadata via [`src/config/seo.config.ts`](src/config/seo.config.ts) and the Next.js Metadata API in `layout.tsx`.
- `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and `/robots.txt` from `src/config/site.config.ts` — update the site URL there once and both stay in sync.

## Deployment

Optimized out of the box for [Vercel](https://vercel.com/):

```bash
pnpm build
pnpm start
```

Set the same variables from `.env.example` in your hosting provider's environment settings. `pnpm analyze` (backed by `@next/bundle-analyzer`) helps you keep an eye on bundle size before shipping.

## FAQ

**Why Base UI instead of Radix or shadcn/ui?**
Base UI is the evolution of Radix (built by the same core contributors, now under the MUI org) with a cleaner API and first-class support for the `render` prop pattern used throughout this codebase. You still get the "own your styles" philosophy of shadcn/ui — the primitives here are copy-in-your-repo components, not a black-box dependency.

**Why not Axios?**
Native `fetch` covers everything Axios does for a typical app (interceptors, JSON handling, error typing) once wrapped, without adding ~15 kB to the client bundle.

**Can I remove the landing page demo?**
Yes — `src/features/landing/` and the demo wiring in `src/app/page.tsx` exist purely to showcase the stack. Delete the feature folder, replace `page.tsx`, and keep everything else (config, providers, `lib/`, `.cursor/rules/`).

---

<div align="center">

Built by <a href="https://omergulcicek.com">Ömer Gülçiçek</a> · <a href="LICENSE">MIT Licensed</a>

</div>
