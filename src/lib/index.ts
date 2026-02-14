import { Discord, Email, FileText, Github, Music, YouTube } from "$lib/assets/index";
import type { ClassValue } from "svelte/elements";
import { m } from "./paraglide/messages";

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
    id: "discord",
    items: [
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
        link: "https://upvote-engine.thelukez.com/",
      },
      {
        id: "linguadeep",
        link: "https://github.com/The-LukeZ/LinguaDeep",
      },
      {
        id: "github-webhook",
        link: "https://github.com/The-LukeZ/github-webhook",
      },
      {
        id: "crossban",
        link: "https://crossban.thelukez.com/",
      },
      {
        id: "jarvis2",
        link: "https://github.com/The-LukeZ/jarvis2",
      },
    ],
  },
  {
    id: "libraries",
    items: [
      {
        id: "fido-scanner",
        link: "https://github.com/The-LukeZ/fido-scanner",
      },
      {
        id: "honocord",
        link: "https://honocord.thelukez.com/",
      },
      {
        id: "topgg-api-types",
        link: "https://github.com/The-LukeZ/topgg-api-types",
      },
      {
        id: "timestring-py",
        link: "https://github.com/The-LukeZ/TimestringPy",
      },
      {
        id: "twitter-x-discord-forwarder",
        link: "https://github.com/The-LukeZ/twitter-x-discord-forwarder",
      },
      {
        id: "lukez-monitor",
        link: "https://github.com/The-LukeZ/lukez-monitor",
      },
      {
        id: "components-v2-for-llms",
        link: "https://github.com/The-LukeZ/ComponentsV2ForLLMs",
      },
    ],
  },
  {
    id: "websites",
    items: [
      {
        id: "burningdezibelz",
        link: "https://github.com/The-LukeZ/burning-dezibelz-v3", // stupid ahh versioning
      },
      {
        id: "portfolio",
        link: "https://thelukez.com",
      },
      {
        id: "ismycodeworking",
        link: "https://ismycodeworking.today",
      },
    ],
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
    name: "Javier Miranda",
    url: "https://unsplash.com/de/@nuvaproductions?utm_source=lukez-portfolio&utm_medium=referral",
  },
  htmlUrl:
    "https://unsplash.com/de/fotos/ein-planet-im-weltraum-AlJ9TQqeCV0?utm_source=lukez-portfolio&utm_medium=referral",
};
