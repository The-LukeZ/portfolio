import { error } from "@sveltejs/kit";
import { env } from "cloudflare:workers";
import { publishedPost } from "#lib/server/feed/index.js";

export const prerender = false;

export const load = ({ params, setHeaders }) => {
  const post = publishedPost(`${params.id}/${params.slug}`);
  if (!post) error(404, "Not found");
  setHeaders({ "cache-control": "public, max-age=60" });
  return { post, turnstileSiteKey: env.TURNSTILE_SITE_KEY };
};
