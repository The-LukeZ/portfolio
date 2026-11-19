import { json } from "@sveltejs/kit";
import type { FeedListItem } from "#lib/feed.js";
import { publishedPosts } from "#lib/server/feed/index.js";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = () => {
  const items: FeedListItem[] = publishedPosts().map(({ slug, title, date, summary, project }) => ({
    slug,
    title,
    date,
    summary,
    project,
  }));
  return json(items, { headers: { "cache-control": "public, max-age=60" } });
};
