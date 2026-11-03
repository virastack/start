const TINTS = [
  "bg-violet-100 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300",
  "bg-sky-100 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300",
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
  "bg-rose-100 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300",
  "bg-cyan-100 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-300",
  "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-400/10 dark:text-fuchsia-300"
]

/** The same user always gets the same color. */
export function getAvatarTint(userId: number) {
  return TINTS[userId % TINTS.length]
}
