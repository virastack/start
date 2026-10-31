//  @ts-check

import { existsSync, readdirSync } from "node:fs";
import { tanstackConfig } from "@tanstack/eslint-config";

const PARENT_IMPORT = {
  group: ["../*"],
  message: "Use a path alias (@/...) instead of a parent-relative import.",
};

// One-way imports: shared folders, then features, then routes.
const SHARED_FILES = [
  "src/{components,config,constants,helpers,hooks,i18n,lib,providers,schemas,stores,styles,test,types}/**/*.{ts,tsx}",
  "src/env.ts",
];
const SHARED_IMPORT = {
  group: ["@/features/*", "#/features/*", "@/routes/*", "#/routes/*"],
  message: "Shared folders must not import features or routes, so a feature can be deleted safely.",
};
const ROUTE_IMPORT = {
  group: ["@/routes/*", "#/routes/*"],
  message: "Features must not import routes. Compose features at the route level.",
};

// Feature boundaries: a feature may import itself, never another feature.
const featuresDir = new URL("./src/features", import.meta.url);
const features = existsSync(featuresDir)
  ? readdirSync(featuresDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

const boundaries = [
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": ["error", { patterns: [PARENT_IMPORT] }] },
  },
  ...features.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            PARENT_IMPORT,
            ROUTE_IMPORT,
            {
              group: [
                "@/features/*",
                `!@/features/${feature}`,
                `!@/features/${feature}/**`,
                "#/features/*",
                `!#/features/${feature}`,
                `!#/features/${feature}/**`,
              ],
              message:
                "Features must not import each other. Move shared code to src/ (components, lib, hooks, ...).",
            },
          ],
        },
      ],
    },
  })),
  {
    files: SHARED_FILES,
    rules: { "no-restricted-imports": ["error", { patterns: [PARENT_IMPORT, SHARED_IMPORT] }] },
  },
];

export default [
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  ...boundaries,
  {
    ignores: [
      "eslint.config.js",
      "knip.config.js",
      "commitlint.config.js",
      "src/routeTree.gen.ts",
      "src/paraglide/**",
      "dist/**",
      ".tanstack/**",
      ".output/**",
    ],
  },
];
