// src/lib/utils/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Architecture note: This utility merges Tailwind classes intelligently.
// Without it, conflicting classes like `p-2 p-4` don't resolve predictably.
// twMerge handles that; clsx handles conditional class application.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
