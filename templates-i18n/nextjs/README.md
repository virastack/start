<div align="center">

# ViraStack Start (Next.js i18n)

**The Next.js boilerplate that feels effortless — with built-in internationalization.**

Next.js 16 · React 19 · Tailwind CSS 4 · next-intl · TypeScript strict · Agent-ready

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-22.x-339933?logo=node.js&logoColor=white)](package.json)

</div>

---

Production-grade Next.js starter with `next-intl`, feature-sliced architecture, strict TypeScript, and a pre-configured [**ViraStack AI**](https://github.com/virastack/ai) layer — so you and your coding agents ship consistent code from day one.

Scaffold this template with [`npx virastack`](https://github.com/virastack/start) and choose the i18n variant when prompted.

## Features

- ⚡ **Next.js 16** — App Router, locale-based routing (`app/[locale]/`)
- 🌐 **next-intl** — English & Turkish out of the box, easy to extend
- ⚛️ **React 19** + TypeScript strict
- 🎨 **Tailwind CSS 4** + shadcn/ui-style components
- 🔄 **TanStack Query** · **Zustand** — server and client state
- 📋 **React Hook Form** + **Zod** — validated forms end to end
- 🤖 **ViraStack AI** — `AGENTS.md`, `.cursor/rules`, `llms.txt`
- ✅ **Quality built in** — ESLint, Prettier, Knip, Husky, Commitlint, GitHub Actions CI

## Getting started

**Prerequisites:** Node.js `22.x`

```bash
npm install
cp .env.example .env
npm run dev
```

Use `pnpm`, `yarn`, or `bun` if you prefer — all scripts work the same.

Open [http://localhost:3000](http://localhost:3000). The landing page demos the stack with localized content.

## Scripts

| Script | Description |
| :--- | :--- |
| `dev` | Start the dev server |
| `build` | Production build |
| `start` | Serve the production build |
| `analyze` | Build with bundle analyzer |
| `lint` / `lint:fix` / `lint:ci` | ESLint (+ format check in CI) |
| `format` / `format:check` | Prettier |
| `typecheck` / `check-types` | `tsc --noEmit` |
| `knip` | Find unused files, exports, and dependencies |
| `commit` | Interactive Conventional Commits (Commitizen) |

## Project structure

```
src/
├── app/
│   └── [locale]/         # Locale-scoped routes
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
│   ├── ui/
│   ├── layout/
│   └── shared/
├── i18n/                 # next-intl routing & navigation
├── messages/             # Translation JSON (en, tr, …)
├── hooks/
├── stores/
├── schemas/
├── providers/
├── lib/
├── config/
├── constants/
├── helpers/
├── types/
├── styles/
└── env.ts
```

The bundled `landing` feature follows the full tree (`api/`, `components/showcase/`, `hooks/`, `schemas/`, etc.). New features should follow the same pattern. See [`docs/architecture-guide.md`](docs/architecture-guide.md) for placement rules.

Search for `FIXME:` tags to customize site config, env vars, locales, and SEO defaults.

## ViraStack AI

Developed with [**ViraStack AI**](https://github.com/virastack/ai) — an AI-native architecture kit that ships agent context into every project:

| File | Purpose |
| :--- | :--- |
| `AGENTS.md` | Agent operating guide |
| `.cursor/rules/` | Scoped coding rules |
| `public/llms.txt` | Machine-readable project summary |

Install or refresh rules: `npx @virastack/ai init`

## Deployment

Optimized for [Vercel](https://vercel.com/). Set variables from `.env.example` in your hosting provider.

---

<div align="center">

Built by <a href="https://omergulcicek.com">Ömer Gülçiçek</a> · <a href="LICENSE">MIT Licensed</a>

</div>
