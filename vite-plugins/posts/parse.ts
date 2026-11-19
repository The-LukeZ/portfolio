import { parse } from "yaml";

/** A post file as written in posts/<unix-ts>/<title-slug>.md, before validation. */
export interface PostSource {
  /** Path relative to posts/ with forward slashes, e.g. "1763650000/my-post.md". */
  file: string;
  /** Derived from the path: "<unix-ts>/<title-slug>". Never written in the file. */
  slug: string;
  title: string;
  /** As written; must carry a timezone offset. */
  date: string;
  summary: string;
  project: string | null;
  image: { src: string; alt: string } | null;
  draft: boolean;
  updated: string | null;
  /** Markdown. */
  body: string;
}

const isEmptyImage = (value: unknown) =>
  value == null ||
  value === "" ||
  (typeof value === "object" && Object.values(value as object).every((v) => v == null || v === ""));

const FRONTMATTER = /^---\n([\s\S]*?)\n---(?:\n|$)/;

/**
 * Splits a post file into frontmatter and body. Values are kept as written (wrong types are
 * reported by validatePosts). The yaml core schema keeps timestamps as strings, so the offset
 * of an unquoted date survives.
 */
export function parsePostFile(file: string, raw: string): PostSource {
  const text = raw.replace(/^\s*(?=---)/, "").replace(/\r\n?/g, "\n");
  const match = FRONTMATTER.exec(text);
  if (!match) throw new Error(`${file}: missing frontmatter block (--- ... ---)`);

  let data: unknown;
  try {
    data = parse(match[1]);
  } catch (err) {
    throw new Error(`${file}: invalid frontmatter YAML: ${(err as Error).message}`);
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${file}: frontmatter must be a YAML mapping`);
  }
  const fm = data as Record<string, unknown>;

  return {
    file,
    slug: file.replace(/\.md$/, ""),
    title: fm.title as string,
    date: fm.date as string,
    summary: fm.summary as string,
    project: (fm.project as string | undefined) || null,
    // The CMS may save an unset optional image as an object with empty values.
    image: isEmptyImage(fm.image) ? null : (fm.image as PostSource["image"]),
    draft: (fm.draft as boolean | undefined) ?? false,
    updated: (fm.updated as string | undefined) || null,
    body: text.slice(match[0].length).replace(/^\n+/, ""),
  };
}
