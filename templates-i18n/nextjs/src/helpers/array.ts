export function sortBy<T>(arr: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
  return [...arr].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    if (aValue === bValue) return 0;
    const comparison = aValue > bValue ? 1 : -1;
    return order === "asc" ? comparison : -comparison;
  });
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  const initial: Record<string, T[]> = {};
  return arr.reduce((acc, item) => {
    const groupKey = String(item[key]);
    acc[groupKey] = acc[groupKey] ?? [];
    acc[groupKey].push(item);
    return acc;
  }, initial);
}

export function uniqueArray<T>(arr: T[], key?: keyof T): T[] {
  if (!key) return Array.from(new Set(arr));
  const seen = new Set();
  return arr.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}
