<div align="center">

<a href="https://github.com/virastack/start" target="_blank" rel="noreferrer">
  <img src="https://raw.githubusercontent.com/virastack/start/main/assets/logo.png" alt="ViraStack Start" height="120" style="max-width: 100%;" />
</a>

# ViraStack Start — TanStack Edition

_The TanStack Start boilerplate that feels effortless._

[![ViraStack TanStack](https://img.shields.io/badge/ViraStack-TanStack-%2300c950)](https://virastack.com)
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

Production-grade TanStack Start starter with feature-based architecture, strict TypeScript, and a pre-configured [**ViraStack AI**](https://github.com/virastack/ai) layer — so you and your coding agents ship consistent code from day one.

## Why ViraStack

- **Opinionated, not opaque** — clear folder rules and placement conventions; nothing important is hidden behind magic
- **Agent-ready by default** — `AGENTS.md`, rules for Claude Code and Cursor, and agent skills ship with every project
- **Own your UI** — Base UI primitives in `components/ui` (shadcn-style), fully editable
- **State triad** — TanStack Query (server), Zustand (client), TanStack Router search params (URL) — each with a dedicated job
- **DX that sticks** — ESLint, Prettier, Knip, Vitest, Husky, Commitlint, and GitHub Actions CI out of the box

## Features

**Included**

- ⚡ **TanStack Start** — file-based TanStack Router, type-safe loaders, SSR
- ⚛️ **React 19** + TypeScript strict (`noUncheckedIndexedAccess`)
- 🎨 **Tailwind CSS 4** + Base UI primitives
- 🔄 **TanStack Query** · **Zustand**
- 🌍 **Paraglide JS** — English and Turkish, with typed messages
- 📋 **React Hook Form** + **Zod** — validated forms end to end
- 🤖 **ViraStack AI** — agent context, scoped rules, design skills
- ✅ **Quality built in** — ESLint, Prettier, Knip, Husky, Commitlint, Vitest + Testing Library + MSW, CI (typecheck → lint → knip → test → build)

**Optional / bring your own**

- Auth, database, analytics, and monitoring — wire them in when you need them; the architecture is ready

## Getting started

**Quick Start & Setup:** Please follow the instructions in the main [ViraStack Start README](https://github.com/virastack/start#quick-start).

Once your project is scaffolded, start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `/` (`/tr` in Turkish) is a short start page from `src/features/home`: the first file to edit and a list of the stack. `/users` (`/tr/users`) is a working demo from `src/features/users`: a paginated, searchable user list, an Add user form and favorites, backed by the [DummyJSON](https://dummyjson.com) demo API. Delete both when you are ready to build.

## Environment variables

Validated in `src/env.ts`. Scaffolded projects already have `.env.local`.

| Variable        | Scope  | Description                                                   |
| :-------------- | :----- | :------------------------------------------------------------ |
| `VITE_APP_URL`  | Public | Canonical app URL (default `http://localhost:3000`)           |
| `VITE_APP_NAME` | Public | Product name shown in UI/metadata (default `ViraStack Start`) |

`NODE_ENV` is set by Vite — do not define it manually. Add new vars in both `.env.example` and `src/env.ts`.

## Scripts

| Script                          | Description                                  |
| :------------------------------ | :------------------------------------------- |
| `dev`                           | Start the Vite + TanStack Start dev server   |
| `build`                         | Production build                             |
| `start` / `preview`             | Serve the production build                   |
| `lint` / `lint:fix` / `lint:ci` | ESLint (+ format check in CI)                |
| `format` / `format:check`       | Prettier                                     |
| `typecheck`                     | `tsc --noEmit`                               |
| `knip`                          | Find unused files, exports, and dependencies |
| `test` / `test:watch`           | Vitest (single run / watch mode)             |

CI runs the same gates: typecheck → lint → knip → test → build (see `.github/workflows/ci.yml`).

## Project structure

```
src/
├── routes/               # File-based routes; pages live under `{-$lang}/`
├── features/
│   ├── home/             # Start page at `/` and `/tr` (deletable)
│   │   ├── components/   # HomePage, StackList
│   │   ├── constants/    # Stack list data and links
│   │   ├── helpers/      # Parses versions read from package.json
│   │   └── icons/        # Brand SVGs used by the stack list
│   └── users/            # Demo feature at `/users` and `/tr/users` (deletable)
│       ├── api/          # DummyJSON calls, query options and keys
│       ├── components/   # UsersPage, UsersDirectory, AddUserForm, FavoriteButton, ...
│       ├── constants/
│       ├── helpers/              # localized-url: lang param, hreflang links
├── messages/             # en.json, tr.json
├── paraglide/            # Generated by Paraglide, do not edit
│       ├── hooks/
│       ├── schemas/      # Zod schemas and URL search params
│       └── stores/       # Favorites (Zustand)
├── components/
│   ├── ui/               # Base UI primitives (Button, Dialog, Tabs, …)
│   └── shared/           # Cross-feature components (ThemeToggle, LanguageSwitcher, …)
├── hooks/                # Shared hooks (promote via Rule of Three)
├── stores/
├── schemas/
├── providers/
├── lib/                  # api.ts, query-client.ts, utils
├── config/
├── constants/
├── helpers/              # localized-url: lang param, hreflang links
├── messages/             # en.json, tr.json
├── paraglide/            # Generated by Paraglide, do not edit
├── types/
├── styles/
├── test/                 # Vitest setup, MSW server, renderWithProviders
├── router.tsx
├── server.ts             # Runs each request inside Paraglide's middleware
├── start.ts              # Global request middleware (security headers)
└── env.ts
```

Both bundled features follow the ViraStack AI feature tree and are meant to be deleted when you start building.

**About the users demo**

- Page and search stay in the URL (`/users?page=2&q=ann`), so a shared link opens the same view
- `POST /users/add` on DummyJSON returns the new user but does not save it, so the user never appears in the list
- Favorites stay in this browser (`localStorage`) through a Zustand store
- The route prefetches on the server at request time, so `vite build` does not need DummyJSON

**Languages**

- English lives at `/` and `/users`, Turkish at `/tr` and `/tr/users`, through the optional `{-$lang}` route param
- `/en` answers with a 301 to `/`, and an unknown language such as `/fr` is a 404
- Only the URL decides the language: a cookie or `Accept-Language` never redirects anyone
- The language switcher loads the other URL as a new document, so the server HTML and the URL always agree
- Add text to every file in `src/messages`; a test fails when their keys differ. Run `pnpm install` or `pnpm build` to regenerate `src/paraglide` afterwards

**Remove the demo**

1. Delete `src/features/users` and `src/routes/{-$lang}/users.tsx`
2. In `src/features/home`, remove the `/users` link from `components/HomePage.tsx` and point the next-step paths in `constants/home.constants.ts` at your own files

**Remove the start page too**

1. Do the steps above, skipping step 2, and delete `src/features/home`
2. Replace `src/routes/{-$lang}/index.tsx` with your own route

Then run `pnpm knip` and remove what it reports as unused, including the messages you no longer call in `src/messages`.

**Rules of thumb**

- Default scope is `features/[feature]/` — promote to global `src/` only when a second feature needs it
- No cross-feature imports; share via `components/`, `lib/`, `hooks/`, etc.
- Path aliases are mandatory; parent-relative imports (`../`) are forbidden
- ESLint enforces both rules (`no-restricted-imports` in the ESLint config)
- Tests live next to the code they cover (`*.test.ts(x)`)

See the ViraStack AI `architecture` rule (`.claude/rules/virastack/` or `.cursor/rules/virastack/`) for placement rules and import conventions.

## Customization

Search the repo for `FIXME:` to find the first things to own:

| File                          | What to change                    |
| :---------------------------- | :-------------------------------- |
| `src/config/site.config.ts`   | Site name, description, metadata  |
| `vite.config.ts`              | Vite / TanStack Start options     |
| `src/start.ts`                | Global request middleware/headers |
| `src/lib/api.ts`              | Auth header / API client wiring   |
| `src/env.ts` + `.env.example` | New environment variables         |
| `public/`                     | Favicon and static assets         |

You own every file — trim demos, rename features, keep only what you need.

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

Works with [Netlify](https://www.netlify.com/), [Cloudflare](https://developers.cloudflare.com/), Nitro, Railway, or any Node host:

1. Push the repo and import the project
2. Set `VITE_APP_URL` and `VITE_APP_NAME` from `.env.example`
3. Deploy — `pnpm build` / `pnpm start` work on any Node host that can serve the Vite output

## Philosophy

- Minimal surface, strong conventions
- Agent-first documentation lives next to the code
- Own your UI and architecture — no locked black boxes
- Production-ready DX without forcing auth/db opinions until you need them

## Contributing

Ideas and bug reports welcome — open an [issue](https://github.com/virastack/start/issues).

PRs that improve DX, architecture docs, or the bundled demo are especially appreciated.

---

<div align="center">

Bootstrapped with [**ViraStack Start**](https://github.com/virastack/start) · Built by <a href="https://omergulcicek.com">Ömer Gülçiçek</a> · <a href="LICENSE">MIT Licensed</a>

</div>
