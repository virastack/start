import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      "jsx-a11y/anchor-is-valid": [
        "error",
        { components: ["Link"], aspects: ["invalidHref", "preferButton"] }
      ]
    },
    settings: {
      tailwindcss: {
        callees: ["clsx", "cn", "cva"],
        classRegex: "^(?:class|className)$"
      }
    }
  }
]);
