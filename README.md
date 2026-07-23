<div align="center">

# ViraStack Start

Scaffold new projects and add tools from the [ViraStack](https://virastack.com) ecosystem with a single command.

[![ViraStack Start](https://img.shields.io/badge/ViraStack-Start-%2300bba7)](https://virastack.com)
[![npm version](https://img.shields.io/npm/v/virastack)](https://www.npmjs.com/package/virastack)
[![npm downloads](https://img.shields.io/npm/dt/virastack)](https://www.npmjs.com/package/virastack)

</div>

---

## Quick Start

```bash
npx virastack
```

Turkish prompts:

```bash
npx virastack --tr
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
| `--tr` | Turkish prompts |
| `--telemetry-disable` | Permanently disable anonymous usage tracking |
| `-v`, `--version` | Print CLI version |
| `-h`, `--help` | Show usage |

## Telemetry

To understand which tools and templates are preferred by the community, ViraStack collects strictly anonymous usage data (template, i18n choice, selected tools, package manager, and CLI version). Absolutely no personal data, project names, or file paths are collected.

Opt out anytime: `npx virastack --telemetry-disable`

## Explore the ViraStack Ecosystem

Discover all tools and libraries at [**virastack.com**](https://virastack.com).

## License

Licensed under the [MIT License](LICENSE).

## Maintainer

A project by [**Ömer Gülçiçek**](https://omergulcicek.com)

[![Follow Ömer Gülçiçek](https://img.shields.io/github/followers/omergulcicek?label=Follow&style=social)](https://github.com/omergulcicek)
