---
name: start-module
description: Builds or changes a ViraStack Start ready module (installed with `npx virastack add <name>`) end to end, from the registry source in this repository to its page on virastack.com (/start/features/<name>), whose sections are a live preview with a Code tab and a copyable prompt, Modülde neler var and Nasıl kullanırsın. Use when adding a module, changing what a module installs, or writing or fixing a module page.
---

# Start module

A module is a working feature the reader copies into their Start project: screens with loading, error and empty states, its data layer, forms and tests. It runs on dummy data with no API. Connecting a real API and adapting the response model is the reader's job; the module only makes that easy. A module brings its own pages, so it works as soon as it is added: the list and its detail page, at the URL its links use.

## Principles

- **Own packages first:** use `@virastack/mask`, `@virastack/password` and `@virastack/address` where they fit. Check their current docs before writing custom code for the same job.
- **shadcn stays original:** never edit or override files under `components/ui`. Custom code lives in the module's own components.
- **Same rules as the templates:** feature folder `src/features/<name>`, no barrels, only the `@/*` alias, one-way imports, English code and comments.
- **Every template:** the module works in all four (`nextjs`, `tanstack`, `nextjs-i18n`, `tanstack-i18n`). Only show work in the Next.js template, but change and test all four.

## Source (this repository)

- `registry/<name>/common/src/features/<name>/`: shared files.
- `registry/<name>/<framework>/`: framework-specific files that replace or add to `common`.
- `registry/<name>/<framework>-i18n/`: the i18n layer replaces the `common` files that hold text and carries `messages/tr.json` and `messages/en.json`, which `virastack add` merges into `src/messages`.
- Pages go in the framework layers, at the template's paths: `src/app/<name>/page.tsx` in `nextjs`, `src/app/[locale]/<name>/page.tsx` in `nextjs-i18n`, `src/routes/<name>/index.tsx` in `tanstack` and `src/routes/{-$lang}/<name>/index.tsx` in `tanstack-i18n`. An i18n layer does not inherit its framework layer, so it carries those files too. The server fetches the first view (Next.js page, TanStack Start `loader` with the router's `QueryClient`), so the visible HTML has the data, and a missing item answers 404 (`notFound()`). The page fills its head from that data: title and description, Open Graph and Twitter (keep the site's defaults: a Next.js page replaces the layout's whole `openGraph`), canonical, `noindex` for search results, and schema.org data (JSON-LD) for an item, built by one helper in `common`. After that, paging, filters and sorting stay on the client, with the state in the URL and real `<a href>` links. No `loading.tsx` above a page: it streams the page, which turns the 404 into a 200 and hides the page without JavaScript. `build-registry` lists every route file as `meta.pages`, the same URLs in all four templates, and the route constant in the module's constants has to match.
- A long list is paginated like `users` (page in the URL, Previous and Next links, an empty page past the end), not loaded on scroll: it behaves the same in every template and survives reload and Back.
- Register the module in `FEATURES` in `scripts/build-registry.js`: `name`, English `title` and `description`, `frameworks`, `route` (`feature`, `component`, optional `fallback` and `routeSearch`: the entry `add --no-pages` names, and for a module without pages the page the site's prompt writes), `packages` for ViraStack packages, `minStartVersion`.
- Dependencies come from the files' imports; template built-ins are left out. A shadcn component no template ships goes in the feature's `ui` list (it becomes `registryDependencies`): `virastack add` installs it only when the project does not have it, never overwrites one, and formats the new file. `sync:preview` copies it into the site preview from shadcn's registry.
- Tests ship with the module: Vitest, Testing Library and MSW, colocated as `*.test.ts(x)`.

## Build and test

1. `npm run check` in this repository.
2. `npm run build:registry` writes the JSON to `../virastack.com/public/r` and runs `sync:preview`, which copies the module into `virastack.com/src/features/start/demos/<name>/` with its `install-files.ts`. The preview is generated: never edit it by hand.
3. `node scripts/e2e.js --full --only <text>` installs a fresh project, runs `add <name>`, typecheck, `lint:ci`, test and a build with the module's pages (a module without pages gets the page the site's prompt asks for, `scripts/feature-route.ts`), then `remove <name>`. For a module with pages it also checks a route collision, starts the built app and asks it for the pages in `e2e` (`FEATURES`: text that must be in the visible HTML, URLs that must answer 404), runs `add <name> --no-pages` with a typecheck, and `remove` with a changed page. Every `remove` has to leave the project as it was. Run it for all four templates before calling the module ready.
4. `add` stops, writing nothing, when the project already has a route for one of the module's URLs (`(group)` folders, `route.ts`, the Pages Router in `src/pages` or `pages`, flat or folder TanStack routes but not a layout that renders an `<Outlet />`, optional segments, `[id]` and `$slug` alike) and, when only pages are in the way, points at `--no-pages`, which installs the feature without its pages. A page file with the module's own content is the module's, not a conflict. Once the feature is in, `add` never fails over pages: existing ones stay as they are, missing ones are added, and one whose URL a route of the project answers is left out with a note. In TanStack Start, `add` and `remove` regenerate `src/routeTree.gen.ts` (`generate-routes`); a failing `generate-routes` or Paraglide `postinstall` is a warning.
5. `remove` deletes the module's files, its pages and the folders they leave empty, and its messages, and asks before deleting files the reader changed. A page that differs from the module's (the reader's own after `--no-pages`, or one they edited) is listed before anything is deleted and goes only on a yes; `--yes` and scripts keep it and warn that it may still import the module. Symlinks are never followed. Check that too.

## Page (virastack.com)

Wire the module:

- `src/config/start-modules.config.ts`: entry with `id` (the `add` argument), `group`, `status: "ready"`, `order` (its place inside the group on the catalog), `tags` and `packages`.
- `src/features/start/components/FeatureDemoPage.tsx`: add the demo to `FEATURE_DEMOS`. It renders alone on `/start/preview/<name>` (noindex, no header or footer), which the page shows in an iframe.
- `src/features/start/components/StartFeatureDetailPage.tsx`: add the module to `READY_CONTENT` with its `route` (the prompt names its `component` and, when set, its `fallback` and `routeSearch`), `pages` for a module with pages (`INSTALL_PAGES` from its `install-files.ts`: the prompt then only runs `add` and opens the page), the `rows` it explains, `previewNote`, `apiKey`, an optional `ownKey` and `hasMoreNote`.
- A module whose message namespace the site already uses for itself gets a rename in `SITE_NAMESPACES` of `scripts/sync-site-preview.js` (products: `StartProducts`); the sync stops otherwise.
- `src/messages/tr.json` and `en.json`, namespace `StartFeatureCatalog`: the card text under `items.<name>` and the detail keys under `detail`.

The page reads top to bottom in this order. Keep it.

1. **Live preview:** the demo from `demos/<name>`, with a one-sentence note under it on what is real and what is not (`Kaydet düğmesi DummyJSON'a gerçek bir istek atar; adres yalnızca bu sayfada kalır`). For card or personal data, say what never to type. The demo's breakpoints follow the iframe, so check it with the mobile (375px), tablet (768px) and desktop buttons. Its Kod tab reads `public/r/<name>-<template>.json` on its own and has the template picker; nothing to write per module. Beside the tabs, "Prompt'u kopyala" gives one framework-agnostic prompt (`readyPrompt`): run `add` and, for a module without pages, open a page at `/<name>` and render the component. There is no manual setup section: agents write the page.
2. **Modülde neler var?:** 4 or 5 rows, one sentence each, one per part the reader gets (list, form, data, selection, safety, tests). Each row starts with a bold phrase that names the part, then says which library does what: `<bold>Adres formu</bold> <rhf>React Hook Form</rhf>, <zod>Zod</zod> ve <shadcn>shadcn/ui</shadcn> ile kurulur...`. The tests row states the tools and the number of test files.
3. **Nasıl kullanırsın?:** two short paragraphs: switching to your own API (which env var or files to change) and "the code is yours" (change it freely, or `npx virastack remove <name>`). Name the module itself, never another module's name.

There is no related-modules section; the catalog page links the modules.

### Copy

- Read `.cursor/rules/brand.mdc` and `.cursor/rules/terminology.mdc` in virastack.com. Address the reader as *sen*; keep `client`, `server`, `agent`, `state` in English.
- Card text (`items.<name>`): one or two sentences on what the reader can do, close in length to the other cards.
- Technologies are rich tags with a badge (`<tanstackquery>`, `<rhf>`, `<zod>`, `<shadcn>`, `<vitest>`, `<msw>`); ViraStack packages are product tags (`<address>Address</address>`). A tag needs a handler in the component; add one there if it is missing.
- `<code>` for every file, hook, env var and command. Bold only for each row's opening phrase.
- Numbers (test files, packages) come from the registry, not memory.

## After the module

- Docs: the Start modules page lists ready modules from the catalog. Update its text, the CLI page and `public/start/llms*.txt` when the module changes what the reader does (see `docs-writing` in virastack.com).
- Open work goes in `../ROADMAP.md` (workspace root); what shipped goes in the CHANGELOG. A new module ships from the registry without a CLI release, unless it needs something the published CLI does not do yet (such as `ui` components): then the CLI goes out first and the site deploy after it. Note it in the next Start release note (`release-notes`).
- Commit and push only when asked. The site publishes the registry, so `public/r` goes live with the site deploy.
