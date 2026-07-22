#!/usr/bin/env node
import { main } from "../src/index.js";

main().catch((error) => {
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
