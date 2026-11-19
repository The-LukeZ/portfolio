import { projectsByLocale } from "#lib/projects/index.js";
import { publishedPosts } from "#lib/server/feed/index.js";
import { buildRss } from "#lib/server/feed/rss.js";

export const prerender = false;

const titles = new Map(projectsByLocale.en.map((p) => [p.id, p.title]));

export function GET() {
  return new Response(
    buildRss(publishedPosts(), (id) => titles.get(id) ?? null),
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}
