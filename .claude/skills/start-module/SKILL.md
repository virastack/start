---
name: start-module
description: Builds or changes a ViraStack Start ready module (installed with `npx virastack add <name>`) end to end, from the registry source in this repository to its page on virastack.com (/start/features/<name>), whose sections are a live preview, Projene ekle, Modülde neler var, Projene neler iner and Nasıl kullanırsın. Use when adding a module, changing what a module installs, or writing or fixing a module page.
---

# Start module

A module is a working feature the reader copies into their Start project: screens with loading, error and empty states, its data layer, forms and tests. It runs on dummy data with no API. Connecting a real API and adapting the response model is the reader's job; the module only makes that easy. A module never brings a page or route: the reader puts it on a page of their own.

## Principles

- **Own packages first:** use `@virastack/mask`, `@virastack/password` and `@virastack/address` where they fit. Check their current docs before writing custom code for the same job.
- **shadcn stays original:** never edit or override files under `components/ui`. Custom code lives in the module's own components.
- **Same rules as the templates:** feature folder `src/features/<name>`, no barrels, only the `@/*` alias, one-way imports, English code and comments.
- **Every template:** the module works in all four (`nextjs`, `tanstack`, `nextjs-i18n`, `tanstack-i18n`). Only show work in the Next.js template, but change and test all four.

## Source (this repository)

- `registry/<name>/common/src/features/<name>/`: shared files.
- `registry/<name>/<framework>/`: framework-specific files that replace or add to `common`.
- `registry/<name>/<framework>-i18n/`: the i18n layer replaces the `common` files that hold text and carries `messages/tr.json` and `messages/en.json`, which `virastack add` merges into `src/messages`.
- Register the module in `FEATURES` in `scripts/build-registry.js`: `name`, English `title` and `description`, `frameworks`, `route` (`feature`, `component`, optional `fallback` and `routeSearch`), `packages` for ViraStack packages, `minStartVersion`.
- Dependencies come from the files' imports; template built-ins are left out. `registryDependencies` is not used.
- Tests ship with the module: Vitest, Testing Library and MSW, colocated as `*.test.ts(x)`.

## Build and test

1. `npm run check` in this repository.
2. `npm run build:registry` writes the JSON to `../virastack.com/public/r` and runs `sync:preview`, which copies the module into `virastack.com/src/features/start/demos/<name>/` with its `install-files.ts`. The preview is generated: never edit it by hand.
3. `node scripts/e2e.js --full --only <text>` installs a fresh project, runs `add <name>`, typecheck, `lint:ci`, test and build with and without the page the site tells people to write, then `remove <name>`. Run it for all four templates before calling the module ready.
4. `remove` deletes the module's files, empty folders and messages, and asks before deleting files the reader changed. Check that too.

## Page (virastack.com)

Wire the module:

- `src/features/start/data/feature-catalog.ts`: entry with `id` (the `add` argument), `group`, `status: "ready"`, `tags` and `packages`.
- `src/features/start/components/StartFeatureDetailPage.tsx`: add the module to `READY_CONTENT` with its `Demo`, `files`, `route`, the `rows` it explains, `previewNote`, `apiKey` and `hasMoreNote`.
- `src/messages/tr.json` and `en.json`, namespace `StartFeatureCatalog`: the card text under `items.<name>` and the detail keys under `detail`.

The page reads top to bottom in this order. Keep it.

1. **Live preview:** the demo from `demos/<name>`, with a one-sentence note under it on what is real and what is not (`Kaydet düğmesi DummyJSON'a gerçek bir istek atar; adres yalnızca bu sayfada kalır`). For card or personal data, say what never to type.
2. **Projene ekle:** `FeatureInstall` builds the prompt and the manual steps from the framework, i18n choice and page path. Nothing to write per module unless the route is unusual.
3. **Modülde neler var?:** 4 to 6 rows, one per part the reader gets (list, form, data, selection, safety, tests). Each row starts with a bold phrase that names the part, then says which library does what: `<bold>Adres formu</bold> <rhf>React Hook Form</rhf> ve <zod>Zod</zod> ile doğrulanır...`. The tests row states the tools and the number of test files.
4. **Projene neler iner?:** `FeatureVariantFileTree` from `install-files.ts`, with the note that no page is created.
5. **Nasıl kullanırsın?:** switching to your own API (which env var or files to change, which parts to adapt to a different response) and "the code is yours" (change it freely, or `npx virastack remove <name>`). Name the module itself, never another module's name.

### Copy

- Read `.cursor/rules/brand.mdc` and `.cursor/rules/terminology.mdc` in virastack.com. Address the reader as *sen*; keep `client`, `server`, `agent`, `state` in English.
- Card text (`items.<name>`): one or two sentences on what the reader can do, close in length to the other cards.
- Technologies are rich tags with a badge (`<tanstackquery>`, `<rhf>`, `<zod>`, `<shadcn>`, `<vitest>`, `<msw>`); ViraStack packages are product tags (`<address>Address</address>`). A tag needs a handler in the component; add one there if it is missing.
- `<code>` for every file, hook, env var and command. Bold only for each row's opening phrase.
- Numbers (test files, packages) come from the registry, not memory.

## After the module

- Docs: the Start modules page lists ready modules from the catalog. Update its text, the CLI page and `public/start/llms*.txt` when the module changes what the reader does (see `docs-writing` in virastack.com).
- Record the change in the local release ledger `../.analiz/11-SURUM-NOTU-KAYDI.md` (workspace root, outside the repository). A new module ships from the registry without a CLI release; note it in the next Start release note (`release-notes`).
- Commit and push only when asked. The site publishes the registry, so `public/r` goes live with the site deploy.
