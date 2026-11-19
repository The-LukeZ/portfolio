/** Client-safe feed helpers. Holds no post data; the list is fetched from /feed/posts.json. */

export interface FeedListItem {
  slug: string;
  title: string;
  /** UTC ISO string. */
  date: string;
  summary: string;
  project: string | null;
}

/** Filter value for posts without a project. */
export const GENERAL = "general";

/** Project ids that have at least one item (in `projectOrder` order), then GENERAL if any item has no project. */
export function filterOptions(items: FeedListItem[], projectOrder: string[]): string[] {
  const used = new Set(items.map((i) => i.project));
  const options = projectOrder.filter((id) => used.has(id));
  if (used.has(null)) options.push(GENERAL);
  return options;
}

/** `null` keeps everything; GENERAL keeps posts without a project; anything else must match exactly. */
export function applyFilter(items: FeedListItem[], filter: string | null): FeedListItem[] {
  if (filter === null) return items;
  if (filter === GENERAL) return items.filter((i) => i.project === null);
  return items.filter((i) => i.project === filter);
}
