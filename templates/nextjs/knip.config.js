/** @type {import('knip').KnipConfig} */
const config = {
  entry: [
    "src/app/**/{page,layout,template,default,route,loading,not-found,error,global-error}.{ts,tsx}",
    "src/app/**/{sitemap,robots}.{ts,tsx}",
    "src/app/api/**/route.{ts,tsx}",
    "src/middleware.{ts,js}",
    "next.config.{js,ts,mjs,cjs}"
  ],
  project: ["src/**/*.{ts,tsx,js,jsx}"],
  ignore: [
    "**/__tests__/**/*",
    "**/*.test.*",
    "**/*.spec.*",
    "node_modules",
    ".next",
    "public",
    "coverage",
    "src/components/ui/**"
  ],
  ignoreDependencies: ["@svgr/webpack", "eslint-plugin-jsx-a11y", "tailwindcss", "tw-animate-css"],
  ignoreBinaries: ["open"],
  rules: {
    dependencies: "error",
    exports: "warn",
    files: "warn"
  }
};

module.exports = config;
