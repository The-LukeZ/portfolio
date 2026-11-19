import { posts } from "./generated/posts.ts";
import type { Post } from "./types.ts";

export type { Post } from "./types.ts";
export { SITE_URL, postUrl } from "./types.ts";
/** Every non-draft post, including future-dated ones. Apply the published rule before exposing them. */
export { posts as allPosts };

/** Published rule: not a draft (drafts never reach the generated list) and dated now or earlier. */
export function publishedPosts(now = Date.now()): Post[] {
  return posts.filter((p) => p.dateMs <= now);
}

export function publishedPost(slug: string, now = Date.now()): Post | undefined {
  return posts.find((p) => p.slug === slug && p.dateMs <= now);
}
