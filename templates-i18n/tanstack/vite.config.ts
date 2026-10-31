import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { paraglideVitePlugin } from "@inlang/paraglide-js"
import tailwindcss from "@tailwindcss/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      strategy: ["url", "cookie", "baseLocale"],
      urlPatterns: [
        {
          pattern: "/:path(.*)?",
          localized: [
            ["tr", "/tr/:path(.*)?"],
            ["en", "/:path(.*)?"]
          ]
        }
      ]
    })
  ]
})

export default config
