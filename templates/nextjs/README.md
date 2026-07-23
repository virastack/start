![ViraStack Next.js](./assets/virastack-nextjs.png)

# ViraStack - Next.js Boilerplate

**The Next.js boilerplate that feels effortless.**

Next.js 16 · React 19 · Tailwind CSS 4 · Base UI · TypeScript strict · Agent-ready

[![ViraStack Next.js](https://img.shields.io/badge/ViraStack-Next.js-%2300bba7)](https://virastack.com)
[![npm version](https://img.shields.io/npm/v/virastack)](https://www.npmjs.com/package/virastack)
[![npm downloads](https://img.shields.io/npm/dt/virastack)](https://www.npmjs.com/package/virastack)
[![Node](https://img.shields.io/badge/node-%3E%3D20.9-339933?logo=node.js&logoColor=white)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![X @virastack](https://img.shields.io/badge/X-@virastack-black?logo=x)](https://x.com/virastack)

---

**Contents:** [Why](#why-virastack) · [Features](#features) · [Getting started](#getting-started) · [Environment](#environment-variables) · [Scripts](#scripts) · [Project structure](#project-structure) · [Customization](#customization) · [ViraStack AI](#virastack-ai) · [Deployment](#deployment) · [Contributing](#contributing)

Production-grade Next.js starter with feature-sliced architecture, strict TypeScript, and a pre-configured [**ViraStack AI**](https://github.com/virastack/ai) layer — so you and your coding agents ship consistent code from day one.

## Why ViraStack

- **Opinionated, not opaque** — clear folder rules and placement conventions; nothing important is hidden behind magic
- **Agent-ready by default** — `AGENTS.md`, Cursor rules, `llms.txt`, and design skills ship with every project
- **Own your UI** — Base UI primitives in `components/ui` (shadcn-style), fully editable
- **State triad** — TanStack Query (server), Zustand (client), nuqs (URL) — each with a dedicated job
- **DX that sticks** — ESLint, Prettier, Knip, Husky, Commitlint, and GitHub Actions CI out of the box

## Features

**Included**

- ⚡ **Next.js 16** — App Router, Turbopack, React Compiler
- ⚛️ **React 19** + TypeScript strict (`noUncheckedIndexedAccess`)
- 🎨 **Tailwind CSS 4** + Base UI primitives
- 🔄 **TanStack Query** · **Zustand** · **nuqs**
- 📋 **React Hook Form** + **Zod** — validated forms end to end
- 🤖 **ViraStack AI** — agent context, scoped rules, design skills
- ✅ **Quality built in** — ESLint, Prettier, Knip, Husky, Commitlint, CI (typecheck → lint → knip → build)

**Optional / bring your own**

- Auth, database, i18n, analytics, and monitoring — wire them in when you need them; the architecture is ready

## Getting started

**Requirements:** Node.js `>=20.9` · recommended package manager: **pnpm**

### Scaffold with the CLI (recommended)

```bash
npx virastack
```

Dependencies are installed for you. Then:

```bash
cd your-project
cp .env.example .env.local
pnpm dev
```

### Use this template directly

```bash
pnpm install   # or npm / yarn / bun
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page is the in-repo playground: theme toggle, TanStack Query user list, Zustand cart, Zod-validated project form, and `nuqs` search state in `UsersDemo`.

## Environment variables

Copy `.env.example` → `.env.local`. Values are validated in `src/env.ts`.

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public | Canonical app URL (default `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_NAME` | Public | Product name shown in UI/metadata (default `ViraStack Start`) |

`NODE_ENV` is set by Next.js — do not define it manually. Add new vars in both `.env.example` and `src/env.ts`.

## Scripts

| Script | Description |
| :--- | :--- |
| `dev` | Start the dev server (Turbopack) |
| `build` | Production build |
| `start` | Serve the production build |
| `analyze` | Build with bundle analyzer |
| `lint` / `lint:fix` / `lint:ci` | ESLint (+ format check in CI) |
| `format` / `format:check` | Prettier |
| `typecheck` | `tsc --noEmit` |
| `knip` | Find unused files, exports, and dependencies |

**Daily DX**

```bash
pnpm typecheck && pnpm lint && pnpm knip   # before a PR
pnpm analyze                              # before shipping bundle-sensitive work
```

CI runs the same gates: typecheck → lint → knip → build (see `.github/workflows/ci.yml`).

## Project structure

```
src/
├── app/                  # Routes, layouts, metadata (App Router only)
├── features/
│   └── [feature]/
│       ├── api/
│       ├── components/
│       ├── constants/
│       ├── data/
│       ├── helpers/
│       ├── hooks/
│       ├── schemas/
│       ├── stores/
│       ├── types/
│       └── index.ts
├── components/
│   ├── ui/               # Base UI primitives (Button, Dialog, Tabs, …)
│   ├── layout/           # Header, Footer
│   └── shared/           # Cross-feature components (ThemeToggle, …)
├── hooks/
├── stores/
├── schemas/
├── providers/
├── lib/                  # api.ts, query-client.ts, utils
├── config/
├── constants/
├── data/
├── helpers/
├── types/
├── styles/
└── env.ts
```

The bundled `landing` feature is a flat demo (`Hero`, `Playground` with showcase sections). New features should follow the full tree above.

**Rules of thumb**

- Default scope is `features/[feature]/` — promote to global `src/` only when a second feature needs it
- No cross-feature imports; share via `components/`, `lib/`, `hooks/`, etc.
- Path aliases are mandatory; parent-relative imports (`../`) are forbidden

See [`docs/architecture-guide.md`](docs/architecture-guide.md) for placement rules and import conventions.

## Customization

Search the repo for `FIXME:` to find the first things to own:

| File | What to change |
| :--- | :--- |
| `src/config/site.config.ts` | Site name, description, metadata |
| `next.config.ts` | Remote image domains and Next.js options |
| `src/lib/api.ts` | Auth header / API client wiring |
| `src/env.ts` + `.env.example` | New environment variables |
| `public/` | Favicon and static assets |

You own every file — trim demos, rename features, keep only what you need.

## ViraStack AI

Developed with [**ViraStack AI**](https://github.com/virastack/ai) — an AI-native architecture kit that ships agent context into every project:

| File | Purpose |
| :--- | :--- |
| `AGENTS.md` | Agent operating guide |
| `CLAUDE.md` | Claude Code entry point |
| `.cursor/rules/` | Scoped coding rules |
| `public/llms.txt` | Machine-readable project summary |
| `.agents/skills/` | Design-taste skills |

Install or refresh rules: `npx @virastack/ai init`

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

PRs that improve DX, architecture docs, or the landing playground are especially appreciated.

---

<div align="center">

Bootstrapped with [**ViraStack Start**](https://github.com/virastack/start) · Built by <a href="https://omergulcicek.com">Ömer Gülçiçek</a> · <a href="LICENSE">MIT Licensed</a>

</div>
