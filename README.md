<div align="center">

# ViraStack Start

Scaffold new projects and add tools from the [ViraStack](https://virastack.com) ecosystem with a single command.

</div>

<br />

<div align="center">
  <a href="https://www.npmjs.com/package/virastack">
    <img src="https://img.shields.io/npm/v/virastack" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/virastack">
    <img src="https://img.shields.io/npm/dt/virastack" alt="npm downloads" />
  </a>
</div>

<br />

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

No package manager prompt: the CLI detects whichever one you invoked it with (npm, pnpm, yarn, or bun) and runs install automatically.

Scaffolded Next.js projects include a pre-configured [**ViraStack AI**](https://github.com/virastack/ai) layer (architecture & rules), alongside specialized design skills from **Emil** (UI/shadcn) and **Jakub** (Animations/Framer).

## Tools

| Tool | Description |
| :--- | :--- |
| `@virastack/mask` | Input masking and formatting (Phone, IBAN, etc.) |
| `@virastack/password` | Password strength indicator and validation |
| `@virastack/ai` | Pre-configured AI layer for Cursor (included in templates by default) |

## Options

| Flag | Description |
| :--- | :--- |
| `--tr` | Turkish prompts |
| `--telemetry-disable` | Permanently disable anonymous usage tracking |
| `-v`, `--version` | Print CLI version |
| `-h`, `--help` | Show usage |

## Telemetry

Anonymous events (template, i18n choice, tools, package manager, CLI version) are sent on create/add. No project names or file paths are collected.

Opt out: `npx virastack --telemetry-disable` or set `VIRASTACK_TELEMETRY_DISABLED=1` / `DO_NOT_TRACK=1`.

## Explore the ViraStack Ecosystem

Discover all tools and libraries at [**virastack.com**](https://virastack.com).

## License

Licensed under the [MIT License](LICENSE).

## Maintainer

A project by [**Ömer Gülçiçek**](https://omergulcicek.com)

[![Follow Ömer Gülçiçek](https://img.shields.io/github/followers/omergulcicek?label=Follow&style=social)](https://github.com/omergulcicek)
