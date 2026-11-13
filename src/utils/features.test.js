import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  compareMessages,
  FeatureConflictError,
  FeatureNotFoundError,
  applyRemoval,
  findMissingUi,
  findRouteConflicts,
  planFiles,
  resolveMissingUi,
  withUi,
  installFeature,
  listFeatures,
  mergeMessages,
  planRemoval,
  removeMessages,
  isOlderVersion,
  RegistryUnavailableError,
  StartTooOldError,
} from "./features.js";

const dirs = [];

function project(files = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "virastack-features-"));
  dirs.push(dir);
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), content);
  }
  return dir;
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("the registry", () => {
  const options = (cwd) => ({ cwd, packageManager: "pnpm", template: "nextjs", i18n: false, isYarnClassic: false });

  afterEach(() => {
    delete process.env.VIRASTACK_REGISTRY_URL;
  });

  it("lists modules from registry.json, one per framework group", async () => {
    const items = ["users-nextjs", "users-tanstack-i18n", "products-nextjs"].map((name) => ({ name }));
    process.env.VIRASTACK_REGISTRY_URL = project({ "registry.json": JSON.stringify({ items }) });
    expect(await listFeatures()).toEqual(["users", "products"]);
  });

  it("lists only the modules a template has, when it is given", async () => {
    const items = ["users-nextjs", "users-tanstack-i18n", "products-nextjs"].map((name) => ({ name }));
    process.env.VIRASTACK_REGISTRY_URL = project({ "registry.json": JSON.stringify({ items }) });
    expect(await listFeatures({ template: "tanstack", i18n: true })).toEqual(["users"]);
    expect(await listFeatures({ template: "nextjs" })).toEqual(["users", "products"]);
  });

  it("lists nothing when it cannot be read", async () => {
    process.env.VIRASTACK_REGISTRY_URL = "http://127.0.0.1:1";
    expect(await listFeatures()).toEqual([]);
  });

  it("says a module does not exist, and refuses a name that is not one", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "registry.json": "{}" });
    await expect(installFeature("ali", options(project()))).rejects.toBeInstanceOf(FeatureNotFoundError);
    await expect(installFeature("../secret", options(project()))).rejects.toBeInstanceOf(FeatureNotFoundError);
  });

  it("tells an unreachable registry apart from a missing module", async () => {
    process.env.VIRASTACK_REGISTRY_URL = "http://127.0.0.1:1";
    await expect(installFeature("users", options(project()))).rejects.toBeInstanceOf(RegistryUnavailableError);
  });
});

describe("compareMessages", () => {
  it("reads nested and flat messages", () => {
    const incoming = { Users: { title: "Users", search: "Search" }, users_x: "x" };
    const current = { Users: { title: "Mine" } };
    expect(compareMessages(current, incoming)).toEqual([
      { name: "Users.title", state: "present" },
      { name: "Users.search", state: "missing" },
      { name: "users_x", state: "missing" },
    ]);
  });

  it("calls a text where a group belongs a conflict, and the other way round", () => {
    expect(compareMessages({ Users: "x" }, { Users: { a: "1" } })).toEqual([{ name: "Users", state: "conflict" }]);
    expect(compareMessages({ a: { b: "1" } }, { a: "x" })).toEqual([{ name: "a", state: "conflict" }]);
  });
});

describe("mergeMessages", () => {
  it("adds next to the project's own messages and keeps them", () => {
    const merged = mergeMessages({ Common: { a: "1" }, Users: { mine: "2" } }, { Users: { title: "Users" } });
    expect(merged).toEqual({ Common: { a: "1" }, Users: { mine: "2", title: "Users" } });
  });
});

describe("isOlderVersion", () => {
  it.each([
    ["1.2.0", "2.0.0", true],
    ["2.0.0", "2.0.0", false],
    ["2.1.0", "2.0.5", false],
    ["2.0.5", "2.1.0", true],
    ["10.0.0", "9.0.0", false],
    [undefined, "2.0.0", true],
  ])("%s against %s", (version, than, expected) => {
    expect(isOlderVersion(version, than)).toBe(expected);
  });
});

describe("minimum Start version", () => {
  afterEach(() => {
    delete process.env.VIRASTACK_REGISTRY_URL;
  });

  it("stops before writing anything when the project is too old", async () => {
    const item = { name: "users-nextjs", files: [], meta: { minStartVersion: "2.0.0" } };
    process.env.VIRASTACK_REGISTRY_URL = project({ "users-nextjs.json": JSON.stringify(item) });
    const cwd = project({ "package.json": JSON.stringify({ virastack: { template: "nextjs", version: "1.2.0" } }) });

    const error = await installFeature("users", {
      cwd,
      packageManager: "pnpm",
      template: "nextjs",
      i18n: false,
      isYarnClassic: false,
    }).catch((caught) => caught);

    expect(error).toBeInstanceOf(StartTooOldError);
    expect(error.current).toBe("1.2.0");
  });
});

describe("installFeature conflicts", () => {
  const registry = (item) => {
    const dir = project({ [`${item.name}.json`]: JSON.stringify(item) });
    process.env.VIRASTACK_REGISTRY_URL = dir;
  };
  const files = [
    { path: "a", type: "registry:file", target: "src/features/users/a.ts", content: "a" },
    { path: "b", type: "registry:file", target: "src/features/users/b.ts", content: "b" },
  ];
  const meta = { messages: { en: { Users: { title: "Users", search: "Search" } }, tr: { Users: { title: "Kullanıcılar", search: "Ara" } } } };
  const install = (cwd) =>
    installFeature("users", {
      cwd,
      packageManager: "pnpm",
      template: "nextjs",
      i18n: true,
      isYarnClassic: false,
    });

  afterEach(() => {
    delete process.env.VIRASTACK_REGISTRY_URL;
  });

  it("stops on a part of the files and writes nothing", async () => {
    registry({ name: "users-nextjs-i18n", files, meta });
    const en = JSON.stringify({ Common: {} });
    const cwd = project({ "src/features/users/a.ts": "mine", "src/messages/en.json": en });
    await expect(install(cwd)).rejects.toBeInstanceOf(FeatureConflictError);
    expect(readFileSync(path.join(cwd, "src/messages/en.json"), "utf8")).toBe(en);
  });

  it("stops on a part of the messages even without the feature folder", async () => {
    registry({ name: "users-nextjs-i18n", files, meta });
    const en = JSON.stringify({ Users: { title: "Customers" } });
    const cwd = project({ "src/messages/en.json": en });
    const error = await install(cwd).catch((caught) => caught);
    expect(error.conflicts).toEqual(["src/messages/en.json: Users.title"]);
    expect(readFileSync(path.join(cwd, "src/messages/en.json"), "utf8")).toBe(en);
  });

  it("stops before writing when one message file is broken", async () => {
    registry({ name: "users-nextjs-i18n", files, meta });
    const cwd = project({ "src/messages/en.json": "{}", "src/messages/tr.json": "{ broken" });
    await expect(install(cwd)).rejects.toThrow("src/messages/tr.json could not be read");
    expect(readFileSync(path.join(cwd, "src/messages/en.json"), "utf8")).toBe("{}");
  });

  it("changes nothing when everything is already there", async () => {
    registry({ name: "users-nextjs-i18n", files, meta });
    const en = JSON.stringify({ Users: { title: "Mine", search: "Mine too" } });
    const cwd = project({
      "src/features/users/a.ts": "a",
      "src/features/users/b.ts": "b",
      "src/messages/en.json": en,
    });
    expect(await install(cwd)).toEqual({ alreadyInstalled: true, untranslated: [] });
    expect(readFileSync(path.join(cwd, "src/messages/en.json"), "utf8")).toBe(en);
  });
});

describe("a module with pages", () => {
  const feature = { path: "a", type: "registry:file", target: "src/features/products/a.ts", content: "a" };
  const list = { path: "p", type: "registry:file", target: "src/app/products/page.tsx", content: "list" };
  const detail = { path: "d", type: "registry:file", target: "src/app/products/[id]/page.tsx", content: "detail" };
  const item = {
    name: "products-nextjs",
    files: [feature, list, detail],
    meta: { pages: [{ path: "/products", file: list.target }, { path: "/products/:id", file: detail.target }] },
  };
  const install = (cwd, extra = {}) =>
    installFeature("products", { cwd, packageManager: "pnpm", template: "nextjs", isYarnClassic: false, ...extra });

  afterEach(() => {
    delete process.env.VIRASTACK_REGISTRY_URL;
  });

  it("stops on a page of the project's at the same path, and says --no-pages helps", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-nextjs.json": JSON.stringify(item) });
    const cwd = project({ "src/app/products/page.tsx": "mine" });

    const error = await install(cwd).catch((caught) => caught);

    expect(error).toBeInstanceOf(FeatureConflictError);
    expect(error.conflicts).toEqual(["src/app/products/page.tsx"]);
    expect(error.routes).toEqual([]);
    expect(error.pages).toBe(true);
    expect(existsSync(path.join(cwd, "src/features/products"))).toBe(false);
  });

  it("stops on a route of the project's that answers the same URL", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-nextjs.json": JSON.stringify(item) });
    const cwd = project({ "src/app/(shop)/products/[slug]/page.tsx": "mine" });

    const error = await install(cwd).catch((caught) => caught);

    expect(error).toBeInstanceOf(FeatureConflictError);
    expect(error.conflicts).toEqual([]);
    expect(error.routes).toEqual(["src/app/(shop)/products/[slug]/page.tsx: /products/:slug"]);
    expect(error.pages).toBe(true);
    expect(existsSync(path.join(cwd, "src/features/products"))).toBe(false);
  });

  it("does not call a part of the feature a page conflict", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-nextjs.json": JSON.stringify({ ...item, files: [feature, { ...feature, target: "src/features/products/b.ts" }, list] }) });
    const cwd = project({ "src/features/products/a.ts": "a" });

    const error = await install(cwd).catch((caught) => caught);

    expect(error.conflicts).toEqual(["src/features/products/a.ts"]);
    expect(error.pages).toBe(false);
  });

  it("counts as installed without its pages after --no-pages, and adds them without the flag", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-nextjs.json": JSON.stringify(item) });
    const cwd = project({ "src/features/products/a.ts": "a" });

    expect(await install(cwd, { pages: false })).toEqual({ alreadyInstalled: true, untranslated: [] });
    const plan = await planFiles(item, cwd, { template: "nextjs", pages: true });
    expect(plan).toMatchObject({ installed: true, conflicts: [], routes: [], writesPages: true });
    expect(plan.writes.map((file) => file.target)).toEqual([list.target, detail.target]);
  });

  it("leaves the pages of an installed module as they are and adds only the missing one", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-nextjs.json": JSON.stringify(item) });
    const cwd = project({ "src/features/products/a.ts": "a", "src/app/products/page.tsx": "mine" });

    const plan = await planFiles(item, cwd, { template: "nextjs" });
    expect(plan).toMatchObject({ installed: true, conflicts: [], routes: [], skippedPages: [] });
    expect(plan.writes.map((file) => file.target)).toEqual([detail.target]);
    expect(await install(cwd, { pages: false })).toEqual({ alreadyInstalled: true, untranslated: [] });
    expect(readFileSync(path.join(cwd, "src/app/products/page.tsx"), "utf8")).toBe("mine");
  });

  it("leaves out a missing page whose URL a route of the project answers, without failing", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-nextjs.json": JSON.stringify(item) });
    const one = project({ "src/features/products/a.ts": "a", "src/app/(shop)/products/page.tsx": "mine" });

    const plan = await planFiles(item, one, { template: "nextjs" });
    expect(plan.writes.map((file) => file.target)).toEqual([detail.target]);
    expect(plan.skippedPages).toEqual([{ file: list.target, routes: ["src/app/(shop)/products/page.tsx: /products"] }]);

    const both = project({
      "src/features/products/a.ts": "a",
      "src/app/(shop)/products/page.tsx": "mine",
      "src/app/(shop)/products/[slug]/page.tsx": "mine",
    });
    expect(await install(both)).toEqual({
      alreadyInstalled: true,
      untranslated: [],
      skippedPages: [
        { file: list.target, routes: ["src/app/(shop)/products/page.tsx: /products"] },
        { file: detail.target, routes: ["src/app/(shop)/products/[slug]/page.tsx: /products/:slug"] },
      ],
    });
  });

  it("treats a file beside a page, such as not-found.tsx, like the pages", async () => {
    const notFound = { path: "n", type: "registry:file", target: "src/app/products/[id]/not-found.tsx", content: "nf" };
    const withNotFound = { ...item, files: [...item.files, notFound] };

    const fresh = await planFiles(withNotFound, project(), { template: "nextjs" });
    expect(fresh.writes.map((file) => file.target)).toContain(notFound.target);
    const bare = await planFiles(withNotFound, project(), { template: "nextjs", pages: false });
    expect(bare.writes.map((file) => file.target)).toEqual([feature.target]);

    // An installed module gets it back, unless the page it belongs to is left out.
    const missing = project({ "src/features/products/a.ts": "a", "src/app/products/page.tsx": "list", "src/app/products/[id]/page.tsx": "detail" });
    const restored = await planFiles(withNotFound, missing, { template: "nextjs" });
    expect(restored.writes.map((file) => file.target)).toEqual([notFound.target]);
    const answered = project({ "src/features/products/a.ts": "a", "src/app/products/page.tsx": "list", "src/app/(shop)/products/[slug]/page.tsx": "mine" });
    const skipped = await planFiles(withNotFound, answered, { template: "nextjs" });
    expect(skipped.writes).toEqual([]);
    expect(skipped.skippedPages.map(({ file }) => file)).toEqual([detail.target]);

    // On a fresh install a file of the project's at its path stops the pages, as a page would.
    const own = await planFiles(withNotFound, project({ [notFound.target]: "mine" }), { template: "nextjs" });
    expect(own.conflicts).toEqual([notFound.target]);
  });

  it("takes a page with the module's own content for the module's, even with the feature gone", async () => {
    const cwd = project({ "src/app/products/page.tsx": "list", "src/app/products/[id]/page.tsx": "detail" });

    const plan = await planFiles(item, cwd, { template: "nextjs", pages: true });

    expect(plan.conflicts).toEqual([]);
    expect(plan.writes.map((file) => file.target)).toEqual([feature.target]);
  });

  it("offers --no-pages only when nothing but the pages is in the way", async () => {
    const two = { ...item, files: [feature, { ...feature, target: "src/features/products/b.ts" }, list] };
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-nextjs.json": JSON.stringify(two) });
    const cwd = project({ "src/features/products/a.ts": "a", "src/app/products/page.tsx": "mine" });

    const error = await install(cwd).catch((caught) => caught);

    expect(error.conflicts).toEqual(["src/features/products/a.ts", "src/app/products/page.tsx"]);
    expect(error.pages).toBe(false);
  });

  it("does not write through a symlinked route folder that leads out of the project", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-nextjs.json": JSON.stringify(item) });
    const outside = project();
    const cwd = project({ "src/app/page.tsx": "home" });
    symlinkSync(outside, path.join(cwd, "src/app/products"));

    const error = await install(cwd).catch((caught) => caught);
    expect(error).toBeInstanceOf(FeatureConflictError);
    expect(error.links).toEqual([list.target, detail.target]);
    expect(existsSync(path.join(cwd, "src/features/products"))).toBe(false);
  });

  it("finds a Pages Router page for the same URL, which would break the build", async () => {
    const cwd = project({ "src/pages/products/[slug].tsx": "mine", "pages/products/index.tsx": "mine" });

    await expect(findRouteConflicts([list, detail], cwd, { template: "nextjs" })).resolves.toEqual([
      "pages/products/index.tsx: /products",
      "src/pages/products/[slug].tsx: /products/:slug",
    ]);
  });

  it("leaves the locale folder out of the URL only in an i18n project", async () => {
    const pages = [{ target: "src/app/[locale]/products/page.tsx" }];
    const cwd = project({ "src/app/[locale]/(shop)/products/page.tsx": "mine", "src/app/products/page.tsx": "mine" });

    await expect(findRouteConflicts(pages, cwd, { template: "nextjs", i18n: true })).resolves.toEqual([
      "src/app/[locale]/(shop)/products/page.tsx: /products",
      "src/app/products/page.tsx: /products",
    ]);
    await expect(findRouteConflicts(pages, cwd, { template: "nextjs" })).resolves.toEqual([
      "src/app/[locale]/(shop)/products/page.tsx: /:locale/products",
    ]);
  });

  it("finds the project's routes for the same URL in TanStack Start, whatever the file layout", async () => {
    const pages = [
      { target: "src/routes/{-$lang}/products/index.tsx" },
      { target: "src/routes/{-$lang}/products/$id.tsx" },
    ];
    const cwd = project({
      "src/routes/{-$lang}/products/index.tsx": "the module's own, left to the file check",
      "src/routes/_shop/products.tsx": "mine",
      "src/routes/products.$product-id.tsx": "mine",
      "src/routes/products.new.tsx": "another URL",
      "src/routes/__root.tsx": "root",
    });

    await expect(findRouteConflicts(pages, cwd, { template: "tanstack", i18n: true })).resolves.toEqual([
      "src/routes/_shop/products.tsx: /products",
      "src/routes/products.$product-id.tsx: /products/:product-id",
    ]);
    await expect(findRouteConflicts(pages, project(), { template: "tanstack", i18n: true })).resolves.toEqual([]);
  });

  it("does not take a TanStack layout for a page", async () => {
    const pages = [{ target: "src/routes/products/index.tsx" }];
    const layouts = project({
      "src/routes/products.tsx": "component: () => <Outlet />",
      "src/routes/products/new.tsx": "child",
      "src/routes/(shop)/products/route.tsx": "component: () => <Outlet />",
    });
    const leaf = project({ "src/routes/products.tsx": "a page of its own" });
    // A page with a child route under it still renders itself, so the module's page never shows.
    const parentPage = project({ "src/routes/products.tsx": "<h1>Mine</h1>", "src/routes/products.$id.tsx": "child" });
    const optional = project({ "src/routes/products/{-$id}.tsx": "mine" });

    await expect(findRouteConflicts(pages, layouts, { template: "tanstack" })).resolves.toEqual([]);
    await expect(findRouteConflicts(pages, leaf, { template: "tanstack" })).resolves.toEqual([
      "src/routes/products.tsx: /products",
    ]);
    await expect(findRouteConflicts(pages, parentPage, { template: "tanstack" })).resolves.toEqual([
      "src/routes/products.tsx: /products",
    ]);
    await expect(findRouteConflicts(pages, optional, { template: "tanstack" })).resolves.toEqual([
      "src/routes/products/{-$id}.tsx: /products/:id?",
    ]);
  });
});

describe("findMissingUi", () => {
  it("lists only the shadcn components the project does not have", async () => {
    const cwd = project({ "src/components/ui/card.tsx": "// mine" });
    const item = { registryDependencies: ["card", "sheet", "../escape"] };

    await expect(findMissingUi(item, cwd)).resolves.toEqual(["sheet"]);
    await expect(findMissingUi({}, cwd)).resolves.toEqual([]);
  });
});

describe("resolveMissingUi", () => {
  it("brings the components a missing one needs, unless the project has them", async () => {
    const cwd = project({
      "components.json": JSON.stringify({ style: "base-vega" }),
      "src/components/ui/button.tsx": "// mine",
    });
    const registry = {
      carousel: { registryDependencies: ["button", "spinner"], files: [{ path: "ui/carousel.tsx" }] },
      spinner: { files: [{ path: "ui/spinner.tsx" }] },
    };
    const asked = [];
    const fetchItem = async (style, name) => {
      asked.push(`${style}/${name}`);
      return registry[name];
    };

    const items = await resolveMissingUi(["carousel"], cwd, fetchItem);
    expect(items.map(({ name }) => name)).toEqual(["carousel", "spinner"]);
    expect(asked).toEqual(["base-vega/carousel", "base-vega/spinner"]);

    const merged = withUi({ files: [{ path: "a.tsx" }], dependencies: ["zod"] }, items);
    expect(merged.registryDependencies).toEqual([]);
    expect(merged.files.map(({ path: file }) => file)).toEqual(["a.tsx", "ui/carousel.tsx", "ui/spinner.tsx"]);
    expect(merged.dependencies).toEqual(["zod"]);
  });
});

describe("removeMessages", () => {
  it("takes out only what the module added", () => {
    const current = { Home: { title: "Home" }, Users: { title: "Users", own: "Mine" } };
    const { kept, removed, changed } = removeMessages(current, { Users: { title: "Users" } });

    expect(kept).toEqual({ Home: { title: "Home" }, Users: { own: "Mine" } });
    expect(removed).toEqual(["Users.title"]);
    expect(changed).toEqual([]);
  });

  it("reads a message with variants as unchanged", () => {
    const count = { declarations: ["input count"], selectors: ["count"], match: { "count=one": "1" } };
    const { kept, changed } = removeMessages({ users_total: [count] }, { users_total: [{ ...count }] });

    expect(kept).toEqual({});
    expect(changed).toEqual([]);
  });

  it("drops a group left empty and reports a text the project changed", () => {
    const { kept, changed } = removeMessages({ Users: { title: "Kişiler" } }, { Users: { title: "Users" } });

    expect(kept).toEqual({});
    expect(changed).toEqual(["Users.title"]);
  });
});

describe("removing a feature", () => {
  const files = [
    { target: "src/features/users/api/get-users.ts", content: "api" },
    { target: "src/app/users/page.tsx", content: "page" },
  ];
  const options = (cwd) => ({ cwd, template: "nextjs", i18n: false, packageManager: "pnpm" });
  const registry = (item) => {
    process.env.VIRASTACK_REGISTRY_URL = project({ [`${item.name}.json`]: JSON.stringify(item) });
  };

  afterEach(() => {
    delete process.env.VIRASTACK_REGISTRY_URL;
  });

  it("deletes the files and the folders they leave empty, and nothing else", async () => {
    registry({ name: "users-nextjs", files });
    const cwd = project({
      "src/features/users/api/get-users.ts": "api",
      "src/features/home/page.tsx": "home",
      "src/app/users/page.tsx": "page",
      "src/app/page.tsx": "root",
    });

    const plan = await planRemoval("users", options(cwd));
    expect(plan.changed).toEqual([]);
    await applyRemoval(plan, options(cwd));

    expect(existsSync(path.join(cwd, "src/features/users"))).toBe(false);
    expect(existsSync(path.join(cwd, "src/app/users"))).toBe(false);
    expect(readFileSync(path.join(cwd, "src/features/home/page.tsx"), "utf8")).toBe("home");
    expect(readFileSync(path.join(cwd, "src/app/page.tsx"), "utf8")).toBe("root");
  });

  it("keeps a folder that still holds the project's own file", async () => {
    registry({ name: "users-nextjs", files });
    const cwd = project({
      "src/features/users/api/get-users.ts": "api",
      "src/features/users/api/mine.ts": "mine",
    });

    await applyRemoval(await planRemoval("users", options(cwd)), options(cwd));

    expect(readFileSync(path.join(cwd, "src/features/users/api/mine.ts"), "utf8")).toBe("mine");
  });

  it("keeps the first folders under src even when they end up empty", async () => {
    registry({ name: "users-nextjs", files });
    const cwd = project({ "src/features/users/api/get-users.ts": "api", "src/app/users/page.tsx": "page" });

    await applyRemoval(await planRemoval("users", options(cwd)), options(cwd));

    expect(existsSync(path.join(cwd, "src/features"))).toBe(true);
    expect(existsSync(path.join(cwd, "src/app"))).toBe(true);
  });

  it("reports a file the project changed, and writes nothing while planning", async () => {
    registry({ name: "users-nextjs", files });
    const cwd = project({ "src/features/users/api/get-users.ts": "edited", "src/app/users/page.tsx": "page" });

    const plan = await planRemoval("users", options(cwd));

    expect(plan.changed).toEqual(["src/features/users/api/get-users.ts"]);
    expect(readFileSync(path.join(cwd, "src/features/users/api/get-users.ts"), "utf8")).toBe("edited");
  });

  it("does not call the import shadcn rewrites a change", async () => {
    const content = 'import * as m from "@/paraglide/messages.js"\n';
    registry({ name: "users-nextjs", files: [{ target: "src/features/users/a.ts", content }] });
    const cwd = project({ "src/features/users/a.ts": 'import * as m from "@/paraglide/messages"\n' });

    expect((await planRemoval("users", options(cwd))).changed).toEqual([]);
  });

  it("finds nothing to do in a project without the module", async () => {
    registry({ name: "users-nextjs", files });

    const plan = await planRemoval("users", options(project({ "package.json": "{}" })));

    expect(plan.files).toEqual([]);
    expect(plan.messages).toEqual([]);
  });

  it("deletes the module's pages and their folders, and keeps the routes folder", async () => {
    const pages = [
      { target: "src/features/products/a.ts", content: "a" },
      { target: "src/app/products/page.tsx", content: "list" },
      { target: "src/app/products/[id]/page.tsx", content: "detail" },
    ];
    registry({ name: "products-nextjs", files: pages });
    const cwd = project({
      "src/features/products/a.ts": "a",
      "src/app/products/page.tsx": "list",
      "src/app/products/[id]/page.tsx": "detail",
    });

    const plan = await planRemoval("products", options(cwd));
    expect(await applyRemoval(plan, options(cwd))).toEqual({});

    expect(existsSync(path.join(cwd, "src/app/products"))).toBe(false);
    expect(existsSync(path.join(cwd, "src/app"))).toBe(true);
  });

  it("puts a page that differs from the module's apart, and deletes it only when asked", async () => {
    const pages = [
      { target: "src/features/products/a.ts", content: "a" },
      { target: "src/app/products/page.tsx", content: "list" },
      { target: "src/app/products/[id]/page.tsx", content: "detail" },
    ];
    registry({ name: "products-nextjs", files: pages });
    const cwd = project({ "src/features/products/a.ts": "a", "src/app/products/page.tsx": "mine" });

    const plan = await planRemoval("products", options(cwd));
    expect(plan).toMatchObject({ files: ["src/features/products/a.ts"], changed: [], changedPages: ["src/app/products/page.tsx"] });
    await applyRemoval(plan, options(cwd));
    expect(readFileSync(path.join(cwd, "src/app/products/page.tsx"), "utf8")).toBe("mine");
    expect(existsSync(path.join(cwd, "src/features/products"))).toBe(false);

    await applyRemoval({ ...plan, files: plan.changedPages }, options(cwd));
    expect(existsSync(path.join(cwd, "src/app/products"))).toBe(false);
  });

  it("never deletes through a symlink, and does not stop on one", async () => {
    const files = [
      { target: "src/features/products/a.ts", content: "a" },
      { target: "src/features/products/api/b.ts", content: "b" },
      { target: "src/features/products/c.ts", content: "c" },
    ];
    registry({ name: "products-nextjs", files });
    const outside = project({ "b.ts": "b", "c.ts": "c" });
    const cwd = project({ "src/features/products/a.ts": "a" });
    symlinkSync(outside, path.join(cwd, "src/features/products/api"));
    symlinkSync(path.join(outside, "c.ts"), path.join(cwd, "src/features/products/c.ts"));

    const plan = await planRemoval("products", options(cwd));
    expect(plan.files).toEqual(["src/features/products/a.ts"]);
    expect(plan.symlinks).toEqual(["src/features/products/api/b.ts", "src/features/products/c.ts"]);
    await applyRemoval(plan, options(cwd));

    expect(readFileSync(path.join(outside, "b.ts"), "utf8")).toBe("b");
    expect(readFileSync(path.join(outside, "c.ts"), "utf8")).toBe("c");
    expect(existsSync(path.join(cwd, "src/features/products/a.ts"))).toBe(false);
  });

  it("keeps the i18n templates' locale folders even when they end up empty", async () => {
    registry({
      name: "products-nextjs-i18n",
      files: [
        { target: "src/app/[locale]/products/page.tsx", content: "list" },
        { target: "src/routes/{-$lang}/products/index.tsx", content: "list" },
      ],
    });
    const cwd = project({
      "src/app/[locale]/products/page.tsx": "list",
      "src/routes/{-$lang}/products/index.tsx": "list",
    });
    const i18n = { ...options(cwd), i18n: true };

    await applyRemoval(await planRemoval("products", i18n), i18n);

    expect(existsSync(path.join(cwd, "src/app/[locale]"))).toBe(true);
    expect(existsSync(path.join(cwd, "src/app/[locale]/products"))).toBe(false);
    expect(existsSync(path.join(cwd, "src/routes/{-$lang}"))).toBe(true);
    expect(existsSync(path.join(cwd, "src/routes/{-$lang}/products"))).toBe(false);
  });

  it("refuses a registry file that points outside the project", async () => {
    registry({ name: "users-nextjs", files: [{ target: "../outside.ts", content: "x" }] });

    await expect(planRemoval("users", options(project()))).rejects.toThrow("outside the project");
  });
});

describe("the TanStack route tree", () => {
  const files = [{ target: "src/features/products/a.ts", content: "a" }, { target: "src/routes/products.tsx", content: "page" }];
  const options = (cwd) => ({ cwd, template: "tanstack", i18n: false, packageManager: "npm" });
  const generate = 'node -e "require(\'fs\').writeFileSync(\'generated.txt\', \'routes\')"';

  afterEach(() => {
    delete process.env.VIRASTACK_REGISTRY_URL;
  });

  it("is generated again when a module's pages go", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-tanstack.json": JSON.stringify({ name: "products-tanstack", files }) });
    const cwd = project({
      "package.json": JSON.stringify({ scripts: { "generate-routes": generate } }),
      "src/features/products/a.ts": "a",
      "src/routes/products.tsx": "page",
    });

    const result = await applyRemoval(await planRemoval("products", options(cwd)), options(cwd));

    expect(result).toEqual({ routeTree: "updated" });
    expect(readFileSync(path.join(cwd, "generated.txt"), "utf8")).toBe("routes");
  });

  it("is a warning, not a failure, in a project without generate-routes", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-tanstack.json": JSON.stringify({ name: "products-tanstack", files }) });
    const cwd = project({ "package.json": "{}", "src/features/products/a.ts": "a", "src/routes/products.tsx": "page" });

    const result = await applyRemoval(await planRemoval("products", options(cwd)), options(cwd));

    expect(result).toEqual({ routeTree: "missing" });
    expect(existsSync(path.join(cwd, "src/routes/products.tsx"))).toBe(false);
  });

  it("compiles the messages only when they changed, and calls a failure a warning", async () => {
    const withMessages = { name: "products-tanstack-i18n", files: files.slice(0, 1), meta: { messages: { en: { Products: { title: "Products" } } } } };
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-tanstack-i18n.json": JSON.stringify(withMessages) });
    const i18n = (cwd) => ({ ...options(cwd), i18n: true });
    const failing = { scripts: { postinstall: "node -e \"process.exit(1)\"" } };

    const cwd = project({
      "package.json": JSON.stringify(failing),
      "src/features/products/a.ts": "a",
      "src/messages/en.json": JSON.stringify({ Products: { title: "Products" } }),
    });
    expect(await applyRemoval(await planRemoval("products", i18n(cwd)), i18n(cwd))).toEqual({ messages: "failed" });

    const untouched = project({
      "package.json": JSON.stringify({ scripts: { postinstall: generate } }),
      "src/features/products/a.ts": "a",
      "src/messages/en.json": "{}",
    });
    expect(await applyRemoval(await planRemoval("products", i18n(untouched)), i18n(untouched))).toEqual({});
    expect(existsSync(path.join(untouched, "generated.txt"))).toBe(false);
  });

  it("is left alone when no page changed", async () => {
    process.env.VIRASTACK_REGISTRY_URL = project({ "products-tanstack.json": JSON.stringify({ name: "products-tanstack", files: files.slice(0, 1) }) });
    const cwd = project({ "package.json": "{}", "src/features/products/a.ts": "a" });

    expect(await applyRemoval(await planRemoval("products", options(cwd)), options(cwd))).toEqual({});
  });
});
