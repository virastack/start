import { z } from "zod"

/**
 * Type-safe environment variable schema.
 *
 * Client-exposed variables MUST be prefixed with `VITE_` (Vite inlines these
 * at build time). Server-only variables have no prefix and must never be
 * read via `import.meta.env` on the client.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development")
})

const clientSchema = z.object({
  VITE_APP_URL: z.string().url().default("http://localhost:3000"),
  VITE_APP_NAME: z.string().min(1).default("ViraStack Start - TanStack Edition")
})

function readEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env[key] != null) {
    return process.env[key]
  }
  return (import.meta.env as Record<string, string | undefined>)[key]
}

const serverParsed = serverSchema.safeParse({
  NODE_ENV: readEnv("NODE_ENV")
})

const clientParsed = clientSchema.safeParse({
  VITE_APP_URL: readEnv("VITE_APP_URL"),
  VITE_APP_NAME: readEnv("VITE_APP_NAME")
})

if (!serverParsed.success || !clientParsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    serverParsed.error?.flatten().fieldErrors,
    clientParsed.error?.flatten().fieldErrors
  )
  throw new Error("Invalid environment variables. Check src/env.ts")
}

export const env = {
  ...serverParsed.data,
  ...clientParsed.data
}
