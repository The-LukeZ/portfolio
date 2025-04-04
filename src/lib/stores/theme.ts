import { writable } from "svelte/store";

// Create a writable store for the theme
export const theme = writable<string>("system");
