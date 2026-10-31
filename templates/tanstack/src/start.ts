import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";

/**
 * Baseline security headers (parity with the Next.js template's `headers()`).
 * Extend or replace when you add CSP / auth middleware.
 */
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();

  result.response.headers.set("X-Frame-Options", "DENY");
  result.response.headers.set("X-Content-Type-Options", "nosniff");
  result.response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  result.response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return result;
});

/** A custom `src/start.ts` turns off TanStack Start's automatic CSRF protection, so it is added here. */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeadersMiddleware, csrfMiddleware],
}));
