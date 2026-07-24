/**
 * Tiny argv parser: splits flags ("--foo", "-f", "--key=value") from
 * positional args. Kept dependency-free since the CLI surface is small.
 *
 * Value-taking long flags consume the next token when it is not itself a flag.
 */

const VALUE_FLAGS = new Set(["name", "template", "tools"]);

/**
 * @param {string[]} argv
 * @returns {{ positionals: string[], flags: Map<string, string | true> }}
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = new Map();
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg.startsWith("--") && arg.length > 2) {
      const body = arg.slice(2);
      const eq = body.indexOf("=");

      if (eq !== -1) {
        flags.set(body.slice(0, eq), body.slice(eq + 1));
        continue;
      }

      if (VALUE_FLAGS.has(body) && i + 1 < args.length && !args[i + 1].startsWith("-")) {
        flags.set(body, args[i + 1]);
        i += 1;
        continue;
      }

      flags.set(body, true);
      continue;
    }

    if (arg.startsWith("-") && arg.length > 1) {
      for (const ch of arg.slice(1)) {
        flags.set(ch, true);
      }
      continue;
    }

    positionals.push(arg);
  }

  return { positionals, flags };
}

export function hasFlag(flags, ...names) {
  return names.some((name) => flags.has(name));
}

export function getFlag(flags, name) {
  return flags.get(name);
}
