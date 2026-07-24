![ViraStack Start](./assets/virastack-start.png)

# ViraStack Start

**One command. Production-ready stack.**

Scaffold new projects and add tools from the [ViraStack](https://virastack.com) ecosystem.

[![ViraStack Start](https://img.shields.io/badge/ViraStack-Start-%2300bba7)](https://virastack.com)
[![npm version](https://img.shields.io/npm/v/virastack)](https://www.npmjs.com/package/virastack)
[![npm downloads](https://img.shields.io/npm/dt/virastack)](https://www.npmjs.com/package/virastack)
[![Node](https://img.shields.io/badge/node-%3E%3D20.9-339933?logo=node.js&logoColor=white)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![X @virastack](https://img.shields.io/badge/X-@virastack-black?logo=x)](https://x.com/virastack)

---

## Who is this for?

- Teams that want a consistent Next.js (and soon TanStack Start) foundation
- Developers who want AI rules, architecture, and tooling ready on day one
- Anyone bootstrapping a new product without reinventing the stack

## Prerequisites

- Node.js `>=20.9`

## Quick Start

```bash
npx virastack
```

Turkish prompts:

```bash
npx virastack --tr
```

Non-interactive (CI / scripts):

```bash
npx virastack my-app --yes
npx virastack init my-app --template nextjs --tools mask,password --yes
npx virastack my-app --yes --skip-install
```

Add a ViraStack tool to an existing project:

```bash
npx virastack add mask
npx virastack add password
```

## What it asks

1. **Project name** — a folder name, or `.` for the current directory.
2. **Template** — Next.js App Router (TanStack Start coming soon).
3. **Multi-language (i18n)** — Choose whether you need built-in internationalization support.
4. **ViraStack tools** — optional `@virastack/mask`, `@virastack/password`.

Scaffolded Next.js projects include a pre-configured [**ViraStack AI**](https://github.com/virastack/ai) layer (architecture & rules), alongside specialized design skills from [**Emil Kowalski**](https://github.com/emilkowalski/skills) and [**Jakub Krehel**](https://github.com/jakubkrehel/make-interfaces-feel-better).

## Tools

| Tool | Description |
| :--- | :--- |
| `@virastack/ai` | Pre-configured AI layer and coding rules for modern AI assistants (included in templates by default) |
| `@virastack/mask` | Input masking and formatting (Phone, IBAN, etc.) |
| `@virastack/password` | Password visibility toggle with customizable icons and text |

## Options

| Flag | Description |
| :--- | :--- |
| `--name <name>` | Project name (or pass as positional / `.`) |
| `--template <name>` | `nextjs` or `tanstack` |
| `--tools <list>` | Comma-separated tools (`mask,password`) |
| `--i18n` / `--no-i18n` | Enable or disable the i18n template |
| `--yes`, `-y` | Non-interactive mode (flags + defaults) |
| `--skip-install` | Scaffold files only; skip install + AI setup |
| `--tr` | Turkish prompts |
| `--telemetry-disable` | Permanently disable anonymous usage tracking |
| `-v`, `--version` | Print CLI version |
| `-h`, `--help` | Show usage |

## Telemetry

To understand which tools and templates are preferred by the community, ViraStack collects strictly anonymous usage data (template, i18n choice, selected tools, package manager, and CLI version). Absolutely no personal data, project names, or file paths are collected.

Opt out anytime: `npx virastack --telemetry-disable`

## Contributing

Ideas and bug reports are welcome — open an [issue](https://github.com/virastack/start/issues).

## Explore the ViraStack Ecosystem

Discover all tools and libraries at [**virastack.com**](https://virastack.com).

## License

Licensed under the [MIT License](LICENSE).

## Maintainer

A project by [**Ömer Gülçiçek**](https://omergulcicek.com)

[![Follow Ömer Gülçiçek](https://img.shields.io/github/followers/omergulcicek?label=Follow&style=social)](https://github.com/omergulcicek)
