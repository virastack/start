<div align="center">
  <img src="./public/nextjs.jpg" alt="Vira Stack Next.js Boilerplate" />
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?logo=reactquery&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Zustand-3B82F6?logo=react&logoColor=white" alt="Zustand" />
</div>

<br />

# ViraStack Start (Next.js i18n)

A production-ready **Next.js 16** boilerplate designed for scalability, performance, and developer happiness.

## Features

- [Next.js 16](https://nextjs.org/) and [React 19](https://react.dev/) with App Router and concurrent rendering
- [TypeScript 5](https://www.typescriptlang.org/) for full type safety
- [Tailwind CSS v4](https://tailwindcss.com/) for scalable and fast styling
- [shadcn/ui](https://ui.shadcn.com/) components for fully accessible, customizable, and owned UI primitives
- [TanStack Query 5](https://tanstack.com/query/latest) for data fetching and caching
- [Zustand](https://zustand-demo.pmnd.rs) for lightweight global state management
- [Zod](https://zod.dev/) + [@t3-oss/env-nextjs](https://env.t3.gg) for runtime validation
- [next-intl](https://next-intl-docs.vercel.app) for internationalization
- [Next Themes](https://github.com/pacocoursey/next-themes) for dynamic light/dark modes
- [Lucide](https://lucide.dev) icons and [Sonner](https://sonner.emilkowal.ski) for notifications
- [Google Analytics](https://analytics.google.com/) integration
- [ESLint 9](https://eslint.org/), [Prettier 3](https://prettier.io/), [Husky](https://github.com/typicode/husky), [lint-staged](https://github.com/okonet/lint-staged), and [Knip](https://knip.dev) for code quality
- SEO-ready with metadata, sitemap, and robots.txt generation
- **Error Handling**: Built-in `error.tsx` and `global-error.tsx` with i18n support and graceful degradation
- **AI-ready**: `llms.txt` & `llms-full.txt` in `/public` plus `.cursor/rules` for LLM context and agent collaboration
- Bundler Analyzer
- Absolute Imports using `@` prefix
- Lighthouse Score: `100`

## Built with @virastack/ai

This boilerplate is designed and powered by [@virastack/ai](https://github.com/virastack/ai), an AI-native architecture kit for modern React. The governance layer that ships with this boilerplate—`.cursor/rules`, `docs/`, and `AGENTS.md`—is derived from `@virastack/ai` and is included by default; no extra setup is required.

## AI-Ready Architecture

This boilerplate is fully aligned with 2026 AI-driven development standards. It is built on [@virastack/ai](https://github.com/virastack/ai) (see **Built with @virastack/ai** above). So that AI agents (Cursor, Windsurf, etc.) can understand the project in seconds, it includes the following optimizations:

- **llms.txt & llms-full.txt**: These files live in the `/public` directory and provide LLMs with high-quality context about the project’s architecture and tech stack.
- **.cursor/rules**: Project-specific rules ensure that when coding with AI assistance, the project's architectural conventions stay consistent.

## Why No Auth or Testing?

This boilerplate aims to stay minimalist and lightweight instead of shipping an “everything included” bundle. Unlike many boilerplates, we deliberately omit Auth and Testing layers:

- **Flexibility**: Every project has different needs for Auth (Clerk, Auth.js, etc.) or Testing (Vitest, Playwright). This boilerplate does not lock you into one choice; it gives you a clean foundation.
- **Zero bloat**: The project stays lean and avoids dependencies you may never use.
- **Fast start**: Skip unnecessary setup and focus on business logic from day one.

## Getting Started

To run this project locally, follow the steps below.

### Requirements

- Node.js 22+ and npm (or pnpm/yarn)

### Installation

```bash
git clone --depth=1 https://github.com/virastack/nextjs-boilerplate my-project
cd my-project
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Environment Variables

The project uses some variables validated at runtime. Create a `.env` file in the root and define at least the following:

```env
NEXT_PUBLIC_SITE_URL=https://localhost:3000
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

The variable schema is defined in `src/env.ts`.

## Customization

You can quickly tailor the Next.js Boilerplate to your needs by searching the project for `FIXME:` tags.

- `.env.example`: runtime environment variables
- `src/env.ts`: environment variables schema (required/optional fields)
- `src/app/robots.ts`: Robots.txt configuration for search engines
- `src/app/sitemap.ts`: Dynamic sitemap generation for SEO
- `src/config/site.config.ts`: site name, description, URL, social accounts, default locales
- `src/config/seo.config.ts`: Metadata-based SEO settings (title, description, Open Graph, Twitter)
- `src/constants/i18n.constants.ts`: Localization settings (supported and default locales)
- `src/lib/api.ts`: Axios instance and request helpers based on `NEXT_PUBLIC_API_URL`

## Project structure

```
├── public/                             # Public assets (llms.txt, llms-full.txt, static files)
├── src/
│   ├── app/                            # App Router with locale support
│   ├── assets/                         # Static and vector assets
│   ├── components/                     # UI and shared components
│   │   ├── icons                       # Svg icons
│   │   ├── layout                      # Page structure (header, footer, sidebar)
│   │   ├── shared                      # Shared domain components
│   │   └── ui                          # Atomic and reusable UI elements
│   ├── config/                         # Site and SEO configurations
│   ├── constants/                      # Global constants (i18n, date, etc.)
│   ├── features/                       # Feature-based modules
│   ├── hooks/                          # Custom React hooks
│   ├── i18n/                           # next-intl configurations
│   ├── lib/                            # Utilities and API layer
│   ├── messages/                       # Translation files (JSON)
│   ├── providers/                      # App-wide providers (Theme, Query, Intl)
│   ├── schemas/                        # Zod validation schemas
│   ├── stores/                         # Application-wide state management
│   ├── styles/                         # Base styling and Tailwind setup
│   ├── types/                          # TypeScript types and interfaces
│   └── env.ts                          # Environment validation
├── .prettierrc                         # Prettier setup with Tailwind and import sorting
├── next.config.ts                      # Next.js configuration
└── tsconfig.json                       # TypeScript configuration
```

## Tips & Recommendations

- **Cursor rules (for Cursor users)**: This repository centralizes AI/editor collaboration rules in `.cursor/rules`. For AI agents, see also **AI-Ready Architecture** above and the `llms.txt` / `llms-full.txt` files in `/public`. Keep rules aligned with the conventions in this README (naming, structure, types, a11y, styling).

- **Cookies (server-side)**: Use Next.js App Router APIs for cookies.
  - `cookies()` from `next/headers` (read/write in server components/actions)
  - `NextResponse.cookies.set` in route handlers/middleware
  - Docs: `https://nextjs.org/docs/app/api-reference/functions/cookies`

- **Helpers (formatting & slug)**:
  - Currency/number/date formatting via `next-intl`:
    - Client: `useFormatter()`
    - Server: `getFormatter()`
  - Slug generation: `@sindresorhus/slugify`

- **Useful hooks (`usehooks-ts`)**: Recommended utilities for common needs
  - `useLocalStorage`, `useSessionStorage`
  - `useMediaQuery`
  - `useDebounceValue`
  - `useOnClickOutside`
  - `useCopyToClipboard`

### Imports & Aliases

- Prefer short aliases with barrel exports for consistency and readability:
  - `@/ui`, `@/hooks`, `@/data`, `@/schemas`, `@/layout`
- Example:

```ts
import { useUsers } from "@/hooks";

import { Button } from "@/ui";
```

- Longer forms like `@/components/ui` are supported but the short aliases above are recommended.

## Naming Conventions

The following naming conventions are recommended for the project.

| Type                               | Example                              | Style                         |
| ---------------------------------- | ------------------------------------ | ----------------------------- |
| Folders & base files               | `locale-switcher`, `query-client.ts` | kebab-case                    |
| Components (widgets/layouts/pages) | `UserList.tsx`                       | PascalCase                    |
| UI elements                        | `button.tsx`                         | kebab-case                    |
| Helper / util files                | `format-currency.ts`                 | kebab-case                    |
| Hook files                         | `use-users.ts`                       | kebab-case (prefix `use-`)    |
| Hook functions                     | `useUsers`                           | camelCase (prefix `use`)      |
| Data files                         | `user.data.ts`                       | kebab-case                    |
| Store files                        | `counter.store.ts`                   | kebab-case                    |
| Icons                              | `ReactIcon`                          | PascalCase (suffix `Icon`)    |
| Types & interfaces                 | `User`, `SiteConfig`                 | PascalCase (no `Type` suffix) |
| Type files                         | `user.types.ts`                      | kebab-case                    |
| Constants                          | `i18n.constants.ts`                  | kebab-case                    |

## Useful commands

### Development

- `npm run dev`: starts the development server
- `npm run build`: production build
- `npm run start`: starts the production server
- `npm run clean`: cleans the `.next` directory

### Code quality and validation

- `npm run lint`: checks lint errors
- `npm run lint:fix`: auto-fixes fixable lint issues and formats
- `npm run lint:ci`: runs lint in CI mode (no warnings allowed) and checks formatting
- `npm run format`: formats with Prettier
- `npm run format:check`: checks formatting
- `npm run typecheck`: verifies type safety
- `npm run knip`: analyzes unused dependencies and files

### Git hooks

- `npm run prepare`: sets up git hooks via Husky

### Bundle Analyzer

To analyze build outputs:

- `npm run analyze`: analyzes bundle sizes and opens the report

### Conventional Commits

This project enforces the Conventional Commits specification. All commit messages must follow the standard. You can use the interactive CLI:

```bash
npm run commit
```

Benefits include automatic release notes and semantic versioning based on commit types.

## Explore the ViraStack Ecosystem

Discover all ViraStack tools, libraries, and boilerplates at [**virastack.com**](https://virastack.com).

## License

Licensed under the <a href="https://github.com/virastack/nextjs-boilerplate/blob/main/LICENSE">MIT License</a>.

## Maintainer

A project by [**Ömer Gülçiçek**](https://omergulcicek.com)

[![Follow Ömer Gülçiçek](https://img.shields.io/github/followers/omergulcicek?label=Follow&style=social)](https://github.com/omergulcicek)
