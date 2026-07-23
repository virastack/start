/** @type {import('knip').KnipConfig} */
const config = {
  entry: [
    "src/app/**/{page,layout,template,default,loading,not-found,error,global-error}.{ts,tsx}",
    "src/app/**/{sitemap,robots}.{ts,tsx}",
  ],
  project: ["src/**/*.{ts,tsx,js,jsx}"],
  ignore: ["src/components/ui/**"],
  ignoreDependencies: ["tailwindcss", "tw-animate-css", "@virastack/ai"],
  rules: {
    dependencies: "error",
    exports: "warn",
    types: "warn",
    files: "warn",
  },
};

module.exports = config;
