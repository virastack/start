// Same shape npm itself enforces for package names (scoped names included).
const NPM_NAME_PATTERN = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/**
 * Returns null when valid, or an error code ("empty" | "invalid") otherwise.
 * "." is always valid — it means "use the current directory".
 */
export function validateProjectName(value) {
  const trimmed = (value ?? "").trim();

  if (trimmed.length === 0) return "empty";
  if (trimmed === ".") return null;
  if (!NPM_NAME_PATTERN.test(trimmed)) return "invalid";

  return null;
}

export function toPackageName(name) {
  const sanitized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-~]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized.length > 0 ? sanitized : "virastack-app";
}
