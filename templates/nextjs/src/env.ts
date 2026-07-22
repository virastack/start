import { z } from "zod";

/**
 * Type-safe environment variable schema.
 *
 * Server-only variables MUST NOT be prefixed with `NEXT_PUBLIC_`.
 * Client-exposed variables MUST be prefixed with `NEXT_PUBLIC_` and
 * explicitly re-read via `process.env.NEXT_PUBLIC_*` at usage sites
 * (Next.js inlines these at build time; dynamic access does not work).
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("ViraStack Start"),
});

const serverParsed = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
});

const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

if (!serverParsed.success || !clientParsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    serverParsed.error?.flatten().fieldErrors,
    clientParsed.error?.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables. Check src/env.ts");
}

export const env = {
  ...serverParsed.data,
  ...clientParsed.data,
};
