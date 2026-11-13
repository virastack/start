<div align="center">

<a href="https://github.com/virastack/start" target="_blank" rel="noreferrer">
  <img src="https://raw.githubusercontent.com/virastack/start/main/assets/logo.png" alt="ViraStack Start" height="120" style="max-width: 100%;" />
</a>

# ViraStack Start — Next.js Edition

_The Next.js boilerplate that feels effortless._

[![ViraStack Next.js](https://img.shields.io/badge/ViraStack-Next.js-%2300c950)](https://virastack.com)
[![npm version](https://img.shields.io/npm/v/virastack)](https://www.npmjs.com/package/virastack)
[![npm downloads](https://img.shields.io/npm/dt/virastack)](https://www.npmjs.com/package/virastack)
[![Node](https://img.shields.io/node/v/virastack)](package.json)
[![License: MIT](https://img.shields.io/github/license/virastack/start)](LICENSE)
[![CI](https://github.com/virastack/start/actions/workflows/ci.yml/badge.svg)](https://github.com/virastack/start/actions/workflows/ci.yml)
[![@virastack](https://img.shields.io/badge/-%40virastack-555?logo=x&logoColor=white)](https://x.com/virastack)

</div>

---

**Docs:** [See the docs](https://virastack.com/start/docs)

**Contents:** [Why](#why-virastack) · [Features](#features) · [Getting started](#getting-started) · [Environment](#environment-variables) · [Scripts](#scripts) · [Project structure](#project-structure) · [Customization](#customization) · [ViraStack AI](#virastack-ai) · [Deployment](#deployment)

Production-grade Next.js starter with feature-based architecture, strict TypeScript, and a pre-configured [**ViraStack AI**](https://github.com/virastack/ai) layer — so you and your coding agents ship consistent code from day one.

## Why ViraStack

- **Opinionated, not opaque** — clear folder rules and placement conventions; nothing important is hidden behind magic
- **Agent-ready by default** — `AGENTS.md`, rules for Claude Code and Cursor, and agent skills ship with every project
- **Own your UI** — Base UI primitives in `components/ui` (shadcn-style), fully editable
- **State triad** — TanStack Query (server), Zustand (client), nuqs (URL) — each with a dedicated job
- **DX that sticks** — ESLint, Prettier, Knip, Vitest, Husky, Commitlint, and GitHub Actions CI out of the box

## Features

**Included**

- ⚡ **Next.js 16** — App Router, Turbopack, React Compiler
- ⚛️ **React 19** + TypeScript strict (`noUncheckedIndexedAccess`)
- 🎨 **Tailwind CSS 4** + Base UI primitives
- 🔄 **TanStack Query** · **Zustand** · **nuqs**
- 📋 **React Hook Form** + **Zod** — validated forms end to end
- 🤖 **ViraStack AI** — agent context, scoped rules, design skills
- ✅ **Quality built in** — ESLint, Prettier, Knip, Husky, Commitlint, Vitest + Testing Library + MSW, CI (typecheck → lint → knip → test → build)

**Optional / bring your own**

- Auth, database, i18n, analytics, and monitoring — wire them in when you need them; the architecture is ready

## Getting started

**Quick Start & Setup:** Please follow the instructions in the main [ViraStack Start README](https://github.com/virastack/start#quick-start).

Once your project is scaffolded, start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `/` is a short start page from `src/features/home`: the first file to edit and a map of the stack. Replace it when you are ready to build. `npx virastack add users` installs a working users module for you to place on a page.

## Environment variables

Validated in `src/env.ts`. Scaffolded projects already have `.env.local`.

| Variable               | Scope  | Description                                                   |
| :--------------------- | :----- | :------------------------------------------------------------ |
| `NEXT_PUBLIC_APP_URL`  | Public | Canonical app URL (default `http://localhost:3000`)           |
| `NEXT_PUBLIC_APP_NAME` | Public | Product name shown in UI/metadata (default `ViraStack Start`) |

`NODE_ENV` is set by Next.js — do not define it manually. Add new vars in both `.env.example` and `src/env.ts`.

## Scripts

| Script                          | Description                                  |
| :------------------------------ | :------------------------------------------- |
| `dev`                           | Start the dev server (Turbopack)             |
| `build`                         | Production build                             |
| `start`                         | Serve the production build                   |
| `analyze`                       | Build with bundle analyzer                   |
| `lint` / `lint:fix` / `lint:ci` | ESLint (+ format check in CI)                |
| `format` / `format:check`       | Prettier                                     |
| `typecheck`                     | `tsc --noEmit`                               |
| `knip`                          | Find unused files, exports, and dependencies |
| `test` / `test:watch`           | Vitest (single run / watch mode)             |

CI runs the same gates: typecheck → lint → knip → test → build (see `.github/workflows/ci.yml`).

## Project structure

```
src/
├── app/                  # Routes, layouts, metadata (App Router only)
├── features/
│   └── home/             # Start page at `/` (deletable)
│       ├── components/   # HomePage, StackList
│       ├── constants/    # Stack list data and links
│       ├── helpers/      # Parses versions read from package.json
│       └── icons/        # Brand SVGs used by the stack list
├── components/
│   ├── ui/               # Base UI primitives (Button, Dialog, Tabs, …)
│   └── shared/           # Cross-feature components (ThemeToggle, …)
├── hooks/                # Shared hooks (promote via Rule of Three)
├── stores/
├── schemas/
├── providers/
├── lib/                  # api.ts, query-client.ts, utils
├── config/
├── constants/
├── helpers/
├── types/
├── styles/
├── test/                 # Vitest setup, MSW server, renderWithProviders
└── env.ts
```

The start page follows the ViraStack AI feature tree and is meant to be deleted when you start building.

**Modules**

Run `npx virastack add <module>` to add a working feature: `users`, `checkout-address`, `checkout-card`, `products` or `cart`. It installs `src/features/<module>` and the packages the module needs. `products` and `cart` also bring their pages; the others print the import line for your own page. See every module and the steps for your framework at [virastack.com/start/features](https://virastack.com/start/features).

Run `npx virastack remove <module>` to take one out. It asks before deleting files you changed, and leaves packages in place because other code may use them.

**About the users module**

- A list with pagination and search in the URL, a shared add and edit form, and row actions for details, editing and deleting, backed by the [DummyJSON](https://dummyjson.com) demo API
- Page and search stay in the URL (`?page=2&q=ann`), so a shared link opens the same view
- DummyJSON answers `POST`, `PUT` and `DELETE` without saving: a new user never appears in the list, and edits and deletes last until the list reloads

**Remove the start page**

1. Delete `src/features/home`
2. Replace `src/app/page.tsx` with your own page

Then run `pnpm knip` and remove what it reports as unused.

**Rules of thumb**

- Default scope is `features/[feature]/` — promote to global `src/` only when a second feature needs it
- No cross-feature imports; share via `components/`, `lib/`, `hooks/`, etc.
- Path aliases are mandatory; parent-relative imports (`../`) are forbidden
- ESLint enforces both rules (`no-restricted-imports` in the ESLint config)
- Tests live next to the code they cover (`*.test.ts(x)`)

See the ViraStack AI `architecture` rule (`.claude/rules/virastack/` or `.cursor/rules/virastack/`) for placement rules and import conventions.

## Customization

Search the repo for `FIXME:` to find the first things to own:

| File                          | What to change                           |
| :---------------------------- | :--------------------------------------- |
| `src/config/site.config.ts`   | Site name, description, metadata         |
| `next.config.ts`              | Remote image domains and Next.js options |
| `src/lib/api.ts`              | Auth header / API client wiring          |
| `src/env.ts` + `.env.example` | New environment variables                |
| `public/`                     | Favicon and static assets                |

You own every file — trim pages, rename features, keep only what you need.

## ViraStack AI

Developed with [**ViraStack AI**](https://github.com/virastack/ai) — an AI-native architecture kit that ships agent context into every project:

| File                       | Purpose                                       |
| :------------------------- | :-------------------------------------------- |
| `CLAUDE.md`                | Claude Code entry point (imports `AGENTS.md`) |
| `.claude/rules/virastack/` | Scoped rules for Claude Code                  |
| `.claude/skills/`          | Skills for Claude Code                        |
| `.cursor/rules/virastack/` | Scoped rules for Cursor                       |
| `AGENTS.md`                | Agent operating guide (managed block + yours) |
| `.agents/skills/`          | Skills for other agents                       |
| `.virastack/ai.json`       | Manifest of the files ViraStack AI manages    |

Install or refresh rules: `npx @virastack/ai init` (pick tools with `--agent claude,cursor`).

## Deployment

Optimized for [Vercel](https://vercel.com/):

1. Push the repo and import the project in Vercel (or your host of choice)
2. Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_APP_NAME` from `.env.example`
3. Run `pnpm analyze` locally before shipping if bundle size matters
4. Deploy — `pnpm build` / `pnpm start` work the same on any Node host

## Philosophy

- Minimal surface, strong conventions
- Agent-first documentation lives next to the code
- Own your UI and architecture — no locked black boxes
- Production-ready DX without forcing auth/db opinions until you need them

## Contributing

Ideas and bug reports welcome — open an [issue](https://github.com/virastack/start/issues).

PRs that improve DX, architecture docs, or the bundled modules are especially appreciated.

---

<div align="center">

Bootstrapped with [**ViraStack Start**](https://github.com/virastack/start) · Built by <a href="https://omergulcicek.com">Ömer Gülçiçek</a> · <a href="LICENSE">MIT Licensed</a>

</div>
