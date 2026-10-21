import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { NEXT_AGENTS_BLOCK, writeNextAgentsBlock } from "./next-agents-md.js";

let dir;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "virastack-next-agents-"));
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

const read = () => fs.readFile(path.join(dir, "AGENTS.md"), "utf8");

describe("writeNextAgentsBlock", () => {
  it("creates AGENTS.md with the Next.js block", async () => {
    expect(await writeNextAgentsBlock(dir)).toBe(true);
    expect(await read()).toBe(NEXT_AGENTS_BLOCK);
  });

  it("keeps the user's content and appends the block", async () => {
    await fs.writeFile(path.join(dir, "AGENTS.md"), "# My rules\n\nBe kind.\n");
    await writeNextAgentsBlock(dir);
    expect(await read()).toBe(`# My rules\n\nBe kind.\n\n${NEXT_AGENTS_BLOCK}`);
  });

  it("does nothing when the block is already there", async () => {
    await writeNextAgentsBlock(dir);
    expect(await writeNextAgentsBlock(dir)).toBe(false);
    expect(await read()).toBe(NEXT_AGENTS_BLOCK);
  });
});
