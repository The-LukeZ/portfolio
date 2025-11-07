import type { ClassValue } from "svelte/elements";
import { m } from "./paraglide/messages";

import {
  Github,
  YouTube,
  Discord,
  Music,
  FileText,
} from "$lib/assets/index.js";

type MaybeClassValue = ClassValue | undefined | null;

export function cn(...classes: MaybeClassValue[]) {
  return classes.filter(Boolean).join(" ").trim();
}

// Helper function to safely access dynamic message keys - utility function first
export const getMessage = (key: string) => {
  return ((m as unknown as Record<string, Function>)[key] ||
    (() => key)) as () => string;
};

const projects = [
  {
    id: "ticketon",
    link: "https://ticketon.app",
  },
  {
    id: "supportmail",
    link: "https://supportmail.dev",
  },
  {
    id: "burningdezibelz",
    link: "https://github.com/The-LukeZ/burning-dezibelz-v2",
  },
  {
    id: "portfolio",
    link: "https://github.com/The-LukeZ/portfolio",
  },
  {
    id: "ismycodeworking",
    link: "https://ismycodeworking.today",
  },
  {
    id: "upvote-engine",
    link: "https://github.com/The-LukeZ/upvote-engine/",
  },
  {
    id: "lukez-monitor",
    link: "https://github.com/The-LukeZ/lukez-monitor",
  },
  {
    id: "djs-command-helper",
    link: "https://github.com/supportmailapp/djsCommandHelper",
  },
  {
    id: "timestring-py",
    link: "https://github.com/The-LukeZ/TimestringPy",
  },
  {
    id: "ddv",
    link: "https://discord-data-viewer.sherpa.software/",
  },
];

const socialLinks = [
  { name: "GitHub", icon: Github, url: "https://github.com/The-LukeZ" },
  {
    name: "YouTube",
    icon: YouTube,
    url: "https://youtube.com/@The_LukeZ",
  },
  { name: "Dev.to", icon: FileText, url: "https://dev.to/thelukez" },
  {
    name: "Discord",
    icon: Discord,
    url: "https://discord.com/users/506893652266844162",
  },
  { name: "Spotify", icon: Music, url: "https://stats.fm/lukez" },
];

export { projects, socialLinks };

/**
 * Calculates the age in years from a given date of birth.
 * @param dob - The date of birth as a `Date` object.
 * @returns The calculated age in years.
 */
export function calculateAge(dob: Date): number {
  // Calculate the absolute value of the difference in years between the age Date object and the year 1970 (UNIX epoch)
  return Math.abs(new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970);
}
