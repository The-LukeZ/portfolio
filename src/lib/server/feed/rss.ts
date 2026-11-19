import { SITE_URL, postUrl, type Post } from "./types.ts";

const MAX_ITEMS = 20;
const KOFI_HTML = `<p><a href="https://ko-fi.com/lukez">Support my work on Ko-fi</a></p>`;

const escapeXml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!,
  );

/** Wraps text in CDATA; a literal "]]>" inside is split across two sections. */
const cdata = (s: string) => `<![CDATA[${s.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

/** RSS 2.0 for the given posts (already published and sorted newest first). */
export function buildRss(posts: Post[], projectTitle: (id: string) => string | null): string {
  const items = posts.slice(0, MAX_ITEMS).map((post) => {
    const category = post.project ? projectTitle(post.project) : null;
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl(post.slug)}</link>
      <guid isPermaLink="true">${postUrl(post.slug)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.summary)}</description>
      <content:encoded>${cdata(post.html + KOFI_HTML)}</content:encoded>${category ? `\n      <category>${escapeXml(category)}</category>` : ""}
    </item>`;
  });

  const lastBuild = new Date(posts[0]?.date ?? 0).toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>LukeZ: Project updates</title>
    <link>${SITE_URL}/feed</link>
    <description>News about my projects: releases, features, milestones.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>
`;
}
