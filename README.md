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

Ask the questions in Turkish instead:

```bash
npx virastack --tr
```

Add a single ViraStack tool to an existing project:

```bash
npx virastack add mask
npx virastack add password
npx virastack add ai
```

## What it asks

`npx virastack` walks you through four short questions and then does the rest itself:

1. **Project name** — type a name, or `.` to scaffold into the current directory.
2. **Template** — `Next.js App Router` today, `TanStack Start` coming soon.
3. **Multi-language (i18n)** — say no to scaffold from `templates/`, or yes to scaffold from the `next-intl`-powered `templates-i18n/` variant.
4. **ViraStack tools** — pick any of `@virastack/mask`, `@virastack/password`, `@virastack/ai` (or none).

There's no package manager prompt and no "install now?" prompt on purpose: the CLI detects the package manager you invoked it with (npm, pnpm, yarn, or bun) and installs dependencies automatically, the same way `create-next-app` does.

## Commands

| Command | Description |
| :--- | :--- |
| `npx virastack` / `npx virastack init` | Interactive project scaffolding. |
| `npx virastack add <tool>` | Add `mask`, `password`, or `ai` to the project in the current directory. |

## Options

| Flag | Description |
| :--- | :--- |
| `--tr` | Ask every question in Turkish instead of English. |
| `--telemetry-disable` | Permanently disable anonymous usage tracking on this machine. |
| `-v`, `--version` | Print the installed CLI version. |
| `-h`, `--help` | Show usage information. |

## Telemetry

ViraStack Start sends a small, anonymous event (selected template, i18n choice, selected tools, package manager, CLI/Node version) whenever a project is created or a tool is added. It never collects your project name, file paths, or any other personal data.

You'll see a one-time notice the first time you run the CLI. To opt out permanently:

```bash
npx virastack --telemetry-disable
```

or set an environment variable (respected on every run, CI-friendly):

```bash
export VIRASTACK_TELEMETRY_DISABLED=1
# or the community standard:
export DO_NOT_TRACK=1
```

## Tips & Recommendations

- **Tailwind CSS v4 Upgrades:** If you see IntelliSense warnings about canonical classes (e.g., `suggestCanonicalClasses`), this means you're using older v3 syntax. You can automatically fix these across your entire project by running the official upgrade tool:
  ```bash
  npx @tailwindcss/upgrade
  ```
- **Slug / URL generation:** Building a blog, CMS, or any route that needs URL-safe slugs? The CLI doesn't ask about this on purpose (too niche for the setup flow). Install [`@sindresorhus/slugify`](https://github.com/sindresorhus/slugify) (MIT licensed) yourself when you need it:
  ```bash
  npm install @sindresorhus/slugify
  ```

## Explore the ViraStack Ecosystem

Discover all ViraStack tools, libraries, and boilerplates at [**virastack.com**](https://virastack.com).

## License

Licensed under the <a href="https://github.com/virastack/start/blob/main/LICENSE">MIT License</a>.

## Maintainer

A project by [**Ömer Gülçiçek**](https://omergulcicek.com)

[![Follow Ömer Gülçiçek](https://img.shields.io/github/followers/omergulcicek?label=Follow&style=social)](https://github.com/omergulcicek)
