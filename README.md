<div align="center">

<a href="https://github.com/virastack/start" target="_blank" rel="noreferrer">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/virastack/start/main/assets/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/virastack/start/main/assets/logo-light.png">
    <img src="https://raw.githubusercontent.com/virastack/start/main/assets/logo-light.png" alt="ViraStack Start" height="120" style="max-width: 100%;" />
  </picture>
</a>

*Scaffolding CLI for Next.js and TanStack Start: ViraStack tools and AI rules in one command*

[![ViraStack Start](https://img.shields.io/badge/ViraStack-Start-%2300bba7)](https://virastack.com/start/)
[![npm version](https://img.shields.io/npm/v/virastack?color=blue)](https://www.npmjs.com/package/virastack)
[![npm downloads](https://img.shields.io/npm/dt/virastack)](https://www.npmjs.com/package/virastack)
[![Node](https://img.shields.io/badge/node-%3E%3D20.9-339933?logo=node.js&logoColor=white)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![@virastack](https://img.shields.io/badge/-%40virastack-black?logo=x&logoColor=white)](https://x.com/virastack)

</div>

---

### [Read the full documentation →](https://virastack.com/start/)

## Features

- **Interactive CLI:** Interactive prompts for template selection, project naming, and ecosystem tool integration.
- **Production-Ready Foundations:** Scaffolds Next.js or TanStack Start projects with pre-configured feature-sliced architecture.
- **Built-in AI Protocols:** Asks which AI coding tools you use (Claude Code, Cursor) and sets up [**ViraStack AI**](https://github.com/virastack/ai) for them — architecture rules in each tool's native format, `AGENTS.md`, and design skills from [**Emil Kowalski**](https://github.com/emilkowalski/skills) and [**Jakub Krehel**](https://github.com/jakubkrehel/skills) — giving your coding agents a strict "constitution" from day one.
- **End-to-End Type Safety:** Strict TypeScript rules, Zod validation, and native package manager alignment (pnpm, npm, yarn, bun).
- **Ecosystem Integration:** Add optional ViraStack tools (`@virastack/mask`, `@virastack/password`) seamlessly.

## Quick Start

**Recommended (pnpm):**
```bash
pnpm dlx virastack
```

**Alternatives:**
```bash
npx virastack
# or
yarn dlx virastack
# or
bunx virastack
```

## What it asks

```text
What is your project named?
  virastack-app

Which template would you like to use?
  › Next.js App Router
    TanStack Start

Which AI coding tools do you use?
  [x] Claude Code
  [x] Cursor

Would you like multi-language (i18n) support?
  › Yes
    No

Which ViraStack tools would you like to include?
  [ ] @virastack/mask
  [ ] @virastack/password
```

Select none to get plain rules in `.agents/rules/` that any agent can read through `AGENTS.md`.

## What it sets up

1. Copies the template and sets the project name.
2. Installs dependencies with the package manager you ran it with.
3. Next.js only: adds the Next.js block to `AGENTS.md`, pointing agents at the docs bundled in `node_modules/next/dist/docs/`.
4. Runs `@virastack/ai init --agent <your choice>`. It never overwrites files you changed.
5. Installs three design skills: `emil-design-eng` ([Emil Kowalski](https://github.com/emilkowalski/skills)), `better-ui` and `better-accessibility` ([Jakub Krehel](https://github.com/jakubkrehel/skills)). They go to `.agents/skills/` and, with Claude Code, to `.claude/skills/`.
6. Creates the first git commit, so `git status` is clean.

`--skip-install` skips step 2. Offline, steps 2, 4 and 5 are skipped and the commands to run later are printed.

## Tools

| Tool | Description |
| :--- | :--- |
| `@virastack/ai` | Pre-configured AI layer and coding rules for modern AI assistants (included in templates by default) |
| `@virastack/mask` | Input masking and formatting (Phone, IBAN, etc.) |
| `@virastack/password` | Password visibility toggle with customizable icons and text |

## Commands and options

| Command / flag | Description |
| :--- | :--- |
| `init [name]` | Create a new project (default; also runs with no command) |
| `add <tool>` | Add a tool to an existing project (`mask`, `password`, `ai`) |
| `--name <name>` | Project name (or pass as positional / `.`) |
| `--template <name>` | `nextjs` or `tanstack` |
| `--tools <list>` | Comma-separated tools (`mask,password`) |
| `--agent <list>` | AI coding tools: `claude`, `cursor` (comma separated) or `none`. Default with `--yes`: both |
| `--i18n` / `--no-i18n` | Enable or disable the i18n template |
| `--yes`, `-y` | Non-interactive mode (flags + defaults) |
| `--skip-install` | Skip dependency install (AI rules and skills are still added) |
| `--tr` | Turkish prompts |
| `--telemetry-disable` | Permanently disable anonymous usage tracking |
| `-v`, `--version` | Print CLI version |
| `-h`, `--help` | Show usage |

```bash
pnpm dlx virastack add mask
pnpm dlx virastack add password
pnpm dlx virastack add ai
pnpm dlx virastack add ai --agent cursor
```

## Included by default

Every template ships with this stack already installed:

| Area | Packages |
| :--- | :--- |
| **State** | TanStack Query, Zustand, nuqs |
| **Form** | React Hook Form, Zod |
| **Hooks** | `usehooks-ts` |
| **UI** | Base UI, Motion, Lucide React |
| **Test** | Vitest, Testing Library, MSW |

[ViraStack AI](https://github.com/virastack/ai) encodes these choices as agent rules so assistants follow the same stack from day one.

## Telemetry

The CLI collects anonymous usage data only: template, options, tools, package manager and CLI version. Opt out: `pnpm dlx virastack --telemetry-disable`

## Contributing

Ideas and bug reports are welcome — open an [issue](https://github.com/virastack/start/issues).

## Ecosystem

Part of the [ViraStack](https://virastack.com) ecosystem: [Academy](https://github.com/virastack/academy) · [AI](https://github.com/virastack/ai) · [Mask](https://github.com/virastack/mask) · [Password](https://github.com/virastack/password) · [Guide](https://github.com/virastack/guide)

## License

[MIT](LICENSE) © [Ömer Gülçiçek](https://omergulcicek.com)
