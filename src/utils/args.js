/**
 * Tiny argv parser: splits flags ("--foo", "-f") from positional args.
 * Kept dependency-free since the CLI's surface area is intentionally small.
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = new Set();
  const positionals = [];

  for (const arg of args) {
    if (arg.startsWith("--") && arg.length > 2) {
      flags.add(arg.slice(2));
    } else if (arg.startsWith("-") && arg.length > 1) {
      flags.add(arg.slice(1));
    } else {
      positionals.push(arg);
    }
  }

  return { positionals, flags };
}
