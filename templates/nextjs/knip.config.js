/** @type {import('knip').KnipConfig} */
const config = {
  entry: [
    "src/app/**/{page,layout,template,default,loading,not-found,error,global-error}.{ts,tsx}",
    "src/app/**/{sitemap,robots,manifest}.{ts,tsx}"
  ],
  project: ["src/**/*.{ts,tsx,js,jsx}"],
  ignore: [
    "src/components/ui/**",
    // components.json points shadcn at this file.
    "src/lib/utils.ts",
    // Used by features from `virastack add`.
    "src/test/render.tsx"
  ],
  // Features from `virastack add` use these.
  ignoreDependencies: [
    "tailwindcss",
    "tw-animate-css",
    // Imported from tailwind.css; knip does not follow CSS imports.
    "shadcn",
    "react-hook-form",
    "@hookform/resolvers",
    "zustand",
    "@testing-library/user-event"
  ],
  // next-env.d.ts imports route types that exist only after `next dev` or `next build`.
  ignoreUnresolved: [/^\.\/\.next\//],
  rules: {
    dependencies: "error",
    exports: "warn",
    types: "warn",
    files: "warn"
  }
}

module.exports = config
