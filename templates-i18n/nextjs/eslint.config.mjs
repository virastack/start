import { existsSync, readdirSync } from "node:fs";

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const PARENT_IMPORT = {
  group: ["../*"],
  message: "Use a path alias (@/...) instead of a parent-relative import.",
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
            {
              group: ["@/features/*", `!@/features/${feature}`, `!@/features/${feature}/**`],
              message:
                "Features must not import each other. Move shared code to src/ (components, lib, hooks, ...).",
            },
          ],
        },
      ],
    },
  })),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  ...boundaries,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
