# Architecture Constitution

## Technical Stack (SSOT)

| Layer            | Technology               | Authority (Rule Ref)   |
| :--------------- | :----------------------- | :--------------------- |
| **Server State** | TanStack Query           | `tanstack-query.mdc`   |
| **Client State** | Zustand                  | `state-management.mdc` |
| **URL State**    | nuqs                     | `state-management.mdc` |
| **Validation**   | Zod                      | `typescript.mdc`       |
| **UI / Styling** | Base UI + Tailwind CSS 4 | `ui-components.mdc`    |
| **API Client**   | Native `fetch` wrapper   | `api.mdc`              |

## Global Directory Hierarchy

Adhere strictly to the following tree structure. Creating arbitrary top-level folders is FORBIDDEN.

```text
src/
├── app/            # Routing & layouts only (Next.js App Router)
├── features/
│   └── [feature]/
│       ├── api/
│       ├── schemas/
│       ├── hooks/
│       ├── stores/
│       └── index.ts
├── components/
│   ├── layout/     # Header, Footer, page-level structure
│   ├── shared/     # Cross-feature, stateful-but-generic (ThemeToggle, ...)
│   └── ui/         # Stateless Base UI-backed primitives (button, input, ...)
├── config/         # site.config.ts, seo.config.ts
├── constants/
├── data/
├── helpers/        # Pure functions, zero package imports
├── hooks/
├── lib/            # Configured instances of external libs (api.ts, query-client.ts, utils.ts)
├── providers/
├── schemas/
├── stores/
├── styles/
├── types/
└── env.ts
```

## Shared vs. Feature Matrix (The Rule of Three)

- **Default Scope:** New logic and components start inside `features/[feature]/`.
- **Promotion:** Logic or components needed by 2+ features MUST be promoted to the global `src/` layer.
- **Cross-Import Ban:** Direct imports between features are FORBIDDEN. Communicate through the shared layer or via props at the page level.
- **Helpers vs Lib:** `helpers/*` are pure functions with **zero** package imports (e.g. `formatDate` using only `Intl`). `lib/*` wraps configured external library instances (e.g. `api.ts`, `query-client.ts`).
- **Data:** Static example/demo data lives in `src/data/*.data.ts` (or `features/[feature]/data/`).
- **Zod Schemas:** All schemas live in `src/schemas/*.schema.ts` (or `features/[feature]/schemas/`). API functions and forms MUST import from this single source to prevent duplication.

## Imports

- **Path Aliases:** Mandatory. See `.cursor/rules/naming-conventions.mdc` for the full alias table (`@/ui`, `@/hooks`, `@/data`, `@/schemas`, `@/layout`).
- **Parent-Relative:** `../`, `../../` imports are FORBIDDEN.

## Server State & Ownership

- **Ownership:** Every query/mutation hook belongs to its feature. Promote to `src/hooks` only if genuinely shared.
- **Defaults:** `staleTime` ~60s by default (see `src/lib/query-client.ts`). Override per-query when justified.
- **No HTTP in UI:** The UI layer is FORBIDDEN from calling `fetch` directly — consume `src/lib/api.ts` (or feature `api/*` functions built on it) only.

## Rendering

- Server Components by default. `"use client"` only on interactive leaves. See `.cursor/rules/nextjs.mdc`.

## Canonical Rules (MDC Refs)

This document is the architectural map. Enforceable laws live in:

- `Ref: .cursor/rules/core-principles.mdc`
- `Ref: .cursor/rules/naming-conventions.mdc`
- `Ref: .cursor/rules/api.mdc`
- `Ref: .cursor/rules/forms.mdc`
- `Ref: .cursor/rules/nextjs.mdc`
- `Ref: .cursor/rules/performance.mdc`
- `Ref: .cursor/rules/react-best-practices.mdc`
- `Ref: .cursor/rules/state-management.mdc`
- `Ref: .cursor/rules/tanstack-query.mdc`
- `Ref: .cursor/rules/typescript.mdc`
- `Ref: .cursor/rules/ui-components.mdc`
