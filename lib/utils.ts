import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge multiple class-value inputs into a single Tailwind-safe class string.
 *
 * @param inputs - One or more class value inputs (strings, arrays, or objects) to combine
 * @returns The combined class string with Tailwind utility conflicts resolved and duplicate classes removed
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}