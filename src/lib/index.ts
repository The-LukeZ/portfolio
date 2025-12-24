import type { ClassValue } from "svelte/elements";
import { m } from "./paraglide/messages";

import { Discord, Email, FileText, Github, Music, YouTube } from "$lib/assets/index.js";

type MaybeClassValue = ClassValue | undefined | null;

export function cn(...classes: MaybeClassValue[]) {
  return classes.filter(Boolean).join(" ").trim();
}

// Helper function to safely access dynamic message keys - utility function first
export const getMessage = (key: string) => {
  return ((m as unknown as Record<string, Function>)[key] || (() => key)) as () => string;
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
    id: "upvote-engine",
    link: "https://vote-handler.lukez.workers.dev/",
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
    url: "discord://-/users/506893652266844162",
  },
  { name: "Spotify", icon: Music, url: "https://stats.fm/lukez" },
  {
    name: "Email",
    icon: Email,
    url: "mailto:contact.lukez@proton.me",
  },
];

export { projects, socialLinks };

export const defaultUnsplashImage = {
  url: "/default_bg.jpg",
  author: {
    name: "Daniel Alexandre Páscoa",
    url: "https://unsplash.com/@daniel_pascoa?utm_source=lukez-portfolio&utm_medium=referral",
  },
  htmlUrl:
    "https://unsplash.com/de/fotos/blick-auf-eine-bergkette-von-der-spitze-eines-hugels-HfFq-_SNuZ8?utm_source=lukez-portfolio&utm_medium=referral",
};
