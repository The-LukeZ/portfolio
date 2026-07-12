import { Discord, Email, FileText, Github, Music, YouTube } from "$lib/assets/index.js";
import { m } from "./paraglide/messages";

// Helper function to safely access dynamic message keys - utility function first
export const getMessage = (key: string) => {
  return ((m as unknown as Record<string, Function>)[key] || (() => key)) as () => string;
};

const socialLinks = [
  {
    name: "GitHub",
    icon: Github,
    url: "https://github.com/The-LukeZ",
  },
  {
    name: "YouTube",
    icon: YouTube,
    url: "https://youtube.com/@The_LukeZ",
  },
  {
    name: "Dev.to",
    icon: FileText,
    url: "https://dev.to/thelukez",
  },
  {
    name: "Discord",
    icon: Discord,
    url: "discord://-/users/506893652266844162",
  },
  {
    name: "Spotify",
    icon: Music,
    url: "https://stats.fm/lukez",
  },
  {
    name: "Email",
    icon: Email,
    url: "mailto:contact.lukez@proton.me",
  },
];

export { socialLinks };

export const defaultUnsplashImage = {
  url: "/default_bg.jpg",
  author: {
    name: "Javier Miranda",
    url: "https://unsplash.com/de/@nuvaproductions?utm_source=lukez-portfolio&utm_medium=referral",
  },
  htmlUrl:
    "https://unsplash.com/de/fotos/ein-planet-im-weltraum-AlJ9TQqeCV0?utm_source=lukez-portfolio&utm_medium=referral",
};

/**
 * Converts a string to title case format.
 *
 * Transforms camelCase or snake_case strings by:
 * - Inserting spaces before capital letters
 * - Replacing underscores with spaces
 * - Capitalizing the first character
 *
 * @param str - The input string to convert
 * @returns The converted title case string
 *
 * @example
 * toTitleCase("helloWorld") // "Hello World"
 * toTitleCase("hello_world") // "Hello World"
 * toTitleCase("HelloWorld") // "Hello World"
 */
export function toTitleCase(str: string): string {
  const result = str
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}
