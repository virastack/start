import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  compareMessages,
  FEATURES,
  FeatureConflictError,
  findFeature,
  installFeature,
  mergeMessages,
  setDemoPath,
} from "./features.js";
import { TOOLS } from "./tools.js";

const REPO = path.resolve(import.meta.dirname, "../..");
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

describe("names", () => {
  it("shares one namespace with tools", () => {
    const names = [...TOOLS.map((tool) => tool.id), ...FEATURES.map((feature) => feature.id)];
    expect(new Set(names).size).toBe(names.length);
  });

  it("finds users", () => {
    expect(findFeature("users")).toMatchObject({ demoPath: "/users" });
    expect(findFeature("mask")).toBeUndefined();
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
    installFeature(findFeature("users"), {
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

describe.each(["templates/nextjs", "templates/tanstack", "templates-i18n/nextjs", "templates-i18n/tanstack"])("DEMO_PATH in %s", (template) => {
  const file = "src/features/home/constants/home.constants.ts";
  const source = readFileSync(path.join(REPO, template, file), "utf8");

  it("can be hidden and shown again", async () => {
    const cwd = project({ [file]: source });

    await setDemoPath(cwd, null);
    expect(readFileSync(path.join(cwd, file), "utf8")).toContain("DEMO_PATH = null as string | null");

    await setDemoPath(cwd, "/users");
    expect(readFileSync(path.join(cwd, file), "utf8")).toBe(source);
  });
});
