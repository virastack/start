# Changelog

## [v0.1.0] - 2026-07-24

### Initial Release

- **ViraStack CLI (`virastack`)**: Scaffold projects and add ViraStack tools with one command
- Interactive prompts (project name, template, i18n, tools) plus Turkish (`--tr`)
- Non-interactive flags: `--yes`/`-y`, `--name`, `--template`, `--tools`, `--i18n`/`--no-i18n`, `--skip-install`
- Template copy ignores build artifacts, env locals, lockfiles, and caches
- Offline-aware install; failed installs print manual next steps (no false “all set”)
- Anonymous telemetry with opt-out (`--telemetry-disable`, `DO_NOT_TRACK`)
- Vitest unit tests for CLI utils; CI smoke scaffold + `npm test`
- Next.js App Router template (React 19, Tailwind CSS 4, Base UI, TanStack Query, Zustand, nuqs, Zod, RHF)
- Canonical `features/landing` demo (delete to start clean); `LandingPage` + reusable layout chrome
- Agent-ready layer via `@virastack/ai` (fetch-first API rules, `ApiError`, `pnpm typecheck`)
- Quality gates: ESLint, Prettier, Knip, Husky (`npm run` pre-push), Commitlint, GitHub Actions
- Security headers in `next.config.ts`; Next.js 16 `src/proxy.ts` scaffold
- SEO/manifest driven by `siteConfig`; optimized logo + `og.png`
