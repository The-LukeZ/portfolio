import type { PostSource } from "./parse.ts";

export const MAX_TITLE = 200;
export const MAX_SUMMARY = 300;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_PREFIX = "/media/feed/";

/** "<unix seconds>/<title slug>", the path the CMS creates (posts/<ts>/<slug>.md). */
const SLUG = /^\d{9,11}\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const OFFSET = /(Z|[+-]\d{2}:\d{2})$/;
const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

export interface ValidationContext {
  projectIds: Set<string>;
  /** Size in bytes of a public path like "/media/feed/x.png", or null if the file does not exist. */
  imageSize: (src: string) => number | null;
}

const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

function checkDate(value: unknown, field: string, problems: string[]) {
  if (typeof value !== "string") {
    problems.push(`${field} must be a date string with a timezone offset, e.g. 2026-11-19T14:00:00+01:00`);
  } else if (!OFFSET.test(value)) {
    problems.push(`${field} "${value}" has no timezone offset (add Z or +01:00)`);
  } else if (Number.isNaN(Date.parse(value))) {
    problems.push(`${field} "${value}" is not a valid date`);
  }
}

/** Returns every problem across all posts (each prefixed with the file name). Never throws. */
export function validatePosts(posts: PostSource[], ctx: ValidationContext): string[] {
  const all: string[] = [];
  const seen = new Map<string, string>();

  for (const post of posts) {
    const problems: string[] = [];

    for (const field of ["title", "date", "summary", "body"] as const) {
      if (!isText(post[field])) problems.push(`${field} is required`);
    }

    if (isText(post.slug)) {
      if (!SLUG.test(post.slug)) {
        problems.push(`path must be posts/<unix timestamp>/<slug>.md, slug only a-z, 0-9 and single -`);
      }
      const other = seen.get(post.slug);
      if (other) problems.push(`duplicate slug "${post.slug}" (also used by ${other})`);
      else seen.set(post.slug, post.file);
    }

    if (isText(post.title) && post.title.length > MAX_TITLE) {
      problems.push(`title is ${post.title.length} chars (max ${MAX_TITLE})`);
    }
    if (isText(post.summary) && post.summary.length > MAX_SUMMARY) {
      problems.push(`summary is ${post.summary.length} chars (max ${MAX_SUMMARY})`);
    }

    if (post.date != null) checkDate(post.date, "date", problems);
    if (post.updated != null) checkDate(post.updated, "updated", problems);

    if (post.project !== null && (typeof post.project !== "string" || !ctx.projectIds.has(post.project))) {
      problems.push(`project "${post.project}" does not exist in projects/en.yaml`);
    }

    if (typeof post.draft !== "boolean") problems.push(`draft must be true or false`);

    if (post.image !== null) {
      const { src, alt } = (post.image ?? {}) as Partial<{ src: unknown; alt: unknown }>;
      if (!isText(alt)) problems.push(`image needs alt text`);
      if (!isText(src)) {
        problems.push(`image src is required when image is set`);
      } else if (!src.startsWith(IMAGE_PREFIX)) {
        problems.push(`image "${src}" must live under ${IMAGE_PREFIX}`);
      } else if (!IMAGE_EXT.test(src)) {
        problems.push(`image "${src}" must be PNG, JPEG, WebP or GIF`);
      } else {
        const size = ctx.imageSize(src);
        if (size === null) problems.push(`image "${src}" not found in static/`);
        else if (size > MAX_IMAGE_BYTES) problems.push(`image "${src}" is larger than 2 MB`);
      }
    }

    all.push(...problems.map((p) => `${post.file}: ${p}`));
  }

  return all;
}
