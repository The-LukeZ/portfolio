export interface Post {
  slug: string;
  title: string;
  /** UTC ISO string. */
  date: string;
  dateMs: number;
  summary: string;
  project: string | null;
  /** `src` is absolute. */
  image: { src: string; alt: string } | null;
  /** UTC ISO string. */
  updated: string | null;
  html: string;
}

export const SITE_URL = "https://thelukez.com";
export const postUrl = (slug: string) => `${SITE_URL}/feed/${slug}`;
