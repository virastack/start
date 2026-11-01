/** @type {import('knip').KnipConfig} */
const config = {
  entry: ["src/router.tsx", "src/start.ts", "src/server.ts", "src/routes/**/*.{ts,tsx}"],
  project: ["src/**/*.{ts,tsx,js,jsx}"],
  ignore: [
    "src/components/ui/**",
    // components.json points shadcn at this file.
    "src/lib/utils.ts"
  ],
  ignoreDependencies: ["tailwindcss", "tw-animate-css"],
  rules: {
    dependencies: "error",
    exports: "warn",
    types: "warn",
    files: "warn"
  }
}

module.exports = config
