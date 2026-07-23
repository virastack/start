<div align="center">

# ViraStack Start (Next.js)

**The Next.js boilerplate that feels effortless.**

Next.js 16 · React 19 · Tailwind CSS 4 · Base UI · TypeScript strict · Agent-ready

[![ViraStack Start](https://img.shields.io/badge/ViraStack-Start-%2300bba7)](https://virastack.com)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.9-339933?logo=node.js&logoColor=white)](package.json)

</div>

---

Production-grade Next.js starter with feature-sliced architecture, strict TypeScript, and a pre-configured [**ViraStack AI**](https://github.com/virastack/ai) layer — so you and your coding agents ship consistent code from day one.

## Features

- ⚡ **Next.js 16** — App Router, Turbopack, React Compiler
- ⚛️ **React 19** + TypeScript strict (`noUncheckedIndexedAccess`)
- 🎨 **Tailwind CSS 4** + Base UI primitives (shadcn-style, fully yours to own)
- 🔄 **TanStack Query** · **Zustand** · **nuqs** — server, client, and URL state, each with a dedicated tool
- 📋 **React Hook Form** + **Zod** — validated forms end to end
- 🤖 **ViraStack AI** — `AGENTS.md`, `.cursor/rules`, `llms.txt`, and design skills
- ✅ **Quality built in** — ESLint, Prettier, Knip, Husky, Commitlint, GitHub Actions CI

## Getting started

**Prerequisites:** Node.js `>=20.9`

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use `pnpm`, `yarn`, or `bun` if you prefer — all scripts work the same.

Open [http://localhost:3000](http://localhost:3000). The landing page demos the stack: theme toggle, TanStack Query user list, Zustand cart, Zod-validated project form, and `nuqs` search state in `UsersDemo`.

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
| `changeset` / `changeset:version` / `changeset:publish` | Changesets release workflow |

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

The bundled `landing` feature is a flat demo (`Hero`, `Playground` with showcase sections). New features should follow the full tree above. See [`docs/architecture-guide.md`](docs/architecture-guide.md) for placement rules and import conventions.

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

Optimized for [Vercel](https://vercel.com/). Set variables from `.env.example` in your hosting provider. Run `analyze` before shipping to keep bundle size in check.

---

<div align="center">

Built by <a href="https://omergulcicek.com">Ömer Gülçiçek</a> · <a href="LICENSE">MIT Licensed</a>

</div>
