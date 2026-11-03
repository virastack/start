/**
 * Pulls major.minor out of a package.json range. Handles npm aliases, which is how
 * this project pins TypeScript: `npm:@typescript/typescript6@^6.0.2` becomes `6.0`.
 */
export function parseVersion(range: string) {
  return /\d+\.\d+/.exec(range)?.[0] ?? range
}
