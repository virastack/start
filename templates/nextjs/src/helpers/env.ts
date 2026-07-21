export const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

export const isServer = (): boolean => !isBrowser();
