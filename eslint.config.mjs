import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules", "templates", "templates-i18n", "coverage"] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": "off",
    },
  },
  {
    files: ["src/**/*.test.js"],
    languageOptions: { globals: { ...globals.node, ...globals.vitest } },
  },
];
