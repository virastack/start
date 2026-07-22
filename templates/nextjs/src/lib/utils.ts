import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names safely, resolving conflicting utility classes.
 *
 * @example
 * cn("px-2 py-1", condition && "bg-primary", "px-4") // => "py-1 bg-primary px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
