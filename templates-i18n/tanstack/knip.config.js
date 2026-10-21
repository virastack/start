/** @type {import('knip').KnipConfig} */
const config = {
  entry: ["src/router.tsx", "src/start.ts", "src/server.ts", "src/routes/**/*.{ts,tsx}"],
  project: ["src/**/*.{ts,tsx,js,jsx}"],
  ignore: [
    "src/components/ui/**",
    // Shared-layer barrels reserved for Rule-of-Three promotions
    "src/hooks/index.ts",
    "src/stores/index.ts",
    "src/schemas/index.ts",
    "src/constants/index.ts",
    // Domain-layer barrels
    "src/features/**/constants/index.ts",
    "src/features/**/constants/*.constants.tsx",
    "src/features/**/schemas/index.ts",
  ],
  ignoreDependencies: ["tailwindcss", "tw-animate-css"],
  rules: {
    dependencies: "error",
    exports: "warn",
    types: "warn",
    files: "warn",
  },
};

module.exports = config;
