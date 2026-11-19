import { error } from "@sveltejs/kit";
import { publishedPost } from "#lib/server/feed/index.js";
import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load: PageServerLoad = ({ params, setHeaders }) => {
  const post = publishedPost(params.slug);
  if (!post) error(404, "Not found");
  setHeaders({ "cache-control": "public, max-age=60" });
  return { post };
};
