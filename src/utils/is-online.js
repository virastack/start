import dns from "node:dns/promises";

/**
 * Best-effort connectivity check against the npm registry host.
 * Used to skip install / network-dependent steps when offline.
 */
export async function isOnline() {
  try {
    await dns.lookup("registry.npmjs.org");
    return true;
  } catch {
    return false;
  }
}
