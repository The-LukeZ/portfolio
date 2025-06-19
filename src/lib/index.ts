import type { ClassValue } from "svelte/elements";
import { m } from "./paraglide/messages";

type MaybeClassValue = ClassValue | undefined | null;

export function cn(...classes: MaybeClassValue[]) {
  return classes.filter(Boolean).join(" ").trim();
}

// Helper function to safely access dynamic message keys - utility function first
export const getMessage = (key: string) => {
  return ((m as unknown as Record<string, Function>)[key] ||
    (() => key)) as () => string;
};
