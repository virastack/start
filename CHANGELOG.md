# Changelog

## [v1.1.0] - 2026-10-22

Works with ViraStack AI v2: the CLI installs `@virastack/ai@2`.

### CLI

- **AI coding tools question**: After the template, asks "Which AI coding tools do you use?" (Claude Code, Cursor, both selected). Selecting none installs plain rules in `.agents/rules/`.
- **`--agent <list>`**: `claude`, `cursor` (comma separated) or `none`. `--yes` without it selects both. Also works with `add ai`.
- **Setup order**: install, Next.js `AGENTS.md` block, `@virastack/ai init --agent <choice>`, design skills, then the first git commit. `git status` is clean after scaffolding.
- **ViraStack AI never forced**: `--force` is no longer passed, so files you changed are kept. `--skip-install` no longer skips the AI rules or skills.
- **Next.js `AGENTS.md` block**: Written directly, as documented for Next.js 16.2+ (points agents to `node_modules/next/dist/docs/`).
- **Design skills**: Every project gets `emil-design-eng` ([emilkowalski/skills](https://github.com/emilkowalski/skills)), `better-ui` and `better-accessibility` ([jakubkrehel/skills](https://github.com/jakubkrehel/skills)). `better-ui` replaces `make-interfaces-feel-better`, which moved into Jakub Krehel's new skills repo. Skills go to `.agents/skills/` and, with Claude Code, to `.claude/skills/` (only `.claude/skills/` when Claude Code is the only tool), as files instead of symlinks. Each skill installs on its own, so one failure does not stop the others. Only offline skips them.
- **Git**: The repo is created before install so husky can set up its hooks. The initial commit skips hooks.
- **Telemetry**: Adds the selected AI coding tool names. No personal data.
- **`prepublishOnly`**: Also removes `.eslintcache` files from the templates.
- **Tests**: Unit tests for `--agent`, the ai and skills commands and the Next.js block. `pnpm test:e2e` scaffolds 16 combinations (2 templates, i18n on and off, 4 tool choices) and checks git, agent folders and `AGENTS.md`; `--full` also installs and runs `typecheck`, `lint:ci` and `test`.

### Templates

- **Tests**: Vitest, Testing Library and MSW in all four templates, with example tests, `test` / `test:watch` scripts and a CI step.
- **Feature boundaries**: ESLint `no-restricted-imports` blocks cross-feature imports and `../` imports.
- **Layout for ViraStack AI v2**: `features/*/data/` became `constants/`, the `@/data` alias is gone, and Next.js i18n messages moved to the root `messages/` folder.
- **Motion**: `framer-motion` replaced by `motion` (`motion/react`).
- **Queries**: The landing users query is defined once with `queryOptions`.
- **TanStack i18n**: Paraglide compiles on `postinstall`; generated files are ignored by git and Prettier.
- **Knip**: Next.js templates no longer fail before `next dev` generates route types.
- **TanStack logo**: The landing demo uses the current flat TanStack logo, drawn in `currentColor`.
- **Hero buttons**: One size smaller (`h-9`), including the theme toggle and the language select.
- **Copy**: Dropped the word "Premium" from template descriptions, `site.config.ts`, `llms.txt` and the hero badge.

## [v1.0.6] - 2026-08-06

### Documentation

- **Template `llms.txt`**: Rewrote i18n Next.js and TanStack editions so agents get locale-aware stack details (`next-intl` / Paraglide) instead of the non-i18n copies.
- **Agent docs links**: Added `llms-full.txt` and ecosystem `llms.txt` links across templates; fixed TanStack product docs URL to `/start/docs`.

## [v1.0.5] - 2026-08-01

### Documentation

- **CLI README**: Documented `init` / `add` commands, added `virastack add` examples, and listed the default stack (Query, Zustand, nuqs, RHF, Zod, Base UI, etc.).
- **Template docs links**: Pointed template README and `llms.txt` product docs to `https://virastack.com/start/docs` (replaced outdated `/nextjs-boilerplate/` URLs).

## [v1.0.4] - 2026-07-28

### Fixed & Improved

- **Next.js Proxy**: Next.js i18n template now exports `createMiddleware(routing)` directly, matching [next-intl](https://next-intl.dev/docs/routing/setup).
- **i18n Locale Checks**: Replaced `includes` + cast with `hasLocale` in `[locale]` layout and `i18n/request.ts`.
- **i18n Messages**: Dropped manual `getMessages()`; `NextIntlClientProvider` inherits messages from `i18n/request.ts` (next-intl 4+).
- **i18n Error Routes**: Added root `app/layout.tsx` + `app/not-found.tsx`, and `[locale]/[...rest]` catch-all per [next-intl error files](https://next-intl.dev/docs/environments/error-files).
- **React Compiler**: Both Next.js templates enable `reactCompiler` only in production to keep local `next dev` lighter.

## [v1.0.3] - 2026-07-28

### Fixed & Improved

- **i18n Static Params**: Added `generateStaticParams` to the Next.js i18n `[locale]` layout per [next-intl routing setup](https://next-intl.dev/docs/routing/setup), so locale segments (`en`, `tr`) are known at build/dev time.

## [v1.0.2] - 2026-07-28

### Fixed & Improved

- **Next.js Proxy**: Both Next.js templates now use `export default async function proxy` to match the Next.js 16 Proxy convention and next-intl composition patterns.
- **i18n Locale Detection**: Removed `localeDetection: false` from the Next.js i18n template so locale negotiation follows next-intl defaults (Accept-Language / cookie).

## [v1.0.1] - 2026-07-27

### Fixed & Improved

- **Skills Installation**: Updated `skills` CLI commands to install non-interactively (`-y`) and target specific skills correctly (`--skill emil-design-eng`).
- **Gitignore Handling**: Templates now use `_gitignore` which is automatically renamed to `.gitignore` during scaffolding. This prevents npm from stripping the file during publish.
- **CLI Prompts**: Updated template descriptions to be more accurate and fair:
  - Next.js: "App Router + Server Components"
  - TanStack Start: "Type-safe routing + SSR"
    
    ## [v1.0.0] - 2026-07-27

### Initial Release

- **ViraStack CLI (`virastack`)**: Scaffold production-ready projects with a single command.
- **Templates**: Included four robust, agent-ready templates out of the box:
  - Next.js 16 (Base)
  - Next.js 16 (with i18n via next-intl)
  - TanStack Start (Base)
  - TanStack Start (with i18n via Inlang Paraglide JS)
- **Interactive Prompts**: Clean CLI wizard to select project name, template, i18n support, and tools.
- **Agent-Ready Architecture**: 
  - Automatically runs `npx @virastack/ai init --force` after install to inject framework-specific agent rules.
  - Writes `AGENTS.md`, `CLAUDE.md`, `docs/`, and `.cursor/rules/*.mdc` via `@virastack/ai`.
  - Installs design skills from [emilkowalski/skills](https://github.com/emilkowalski/skills) (7 skills) and [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better).
  - Out-of-the-box support for Cursor, Claude Code, and other agents via `AGENTS.md`.
- **Modern Tech Stack**: React 19, Tailwind CSS 4, Base UI, TanStack Query, Zustand, React Hook Form, and Zod.
- **i18n Implementation**: Type-safe, chunked JSON translation strategies to prevent string-splitting bugs.
- **Quality Gates**: Pre-configured ESLint, Prettier, Knip, Husky, Commitlint, and GitHub Actions CI.
- **Developer Experience (DX)**: 
  - Offline-aware installation and robust error handling.
  - Non-interactive flags for automation (`--yes`, `--template`, `--i18n`).
  - Feature-sliced architecture with a ready-to-use `landing` module demo.
  - Strict TypeScript (`noUncheckedIndexedAccess`).

## [v0.0.1] - 2026-03-26

- **Note**: Placeholder release to secure the `virastack` npm package name. No CLI features were included in this build.
