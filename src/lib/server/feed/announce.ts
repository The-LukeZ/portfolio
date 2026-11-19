import { projectsByLocale } from "../../projects/index.ts";
import { buildWebhookPayload, sendWebhook } from "./discord.ts";
import { publishedPosts } from "./index.ts";

/** Only posts dated within this window are announced; older ones are marked as handled. */
export const WINDOW_MS = 24 * 60 * 60 * 1000;
export const MAX_PER_RUN = 5;
export const MAX_ATTEMPTS = 5;

type Status = "sent" | "skipped" | "pending" | "given_up";

const titles = new Map(projectsByLocale.en.map((p) => [p.id, p.title]));

const UPSERT = `INSERT INTO announcements (slug, status, attempts, updated_at) VALUES (?1, ?2, 0, ?3)
  ON CONFLICT(slug) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`;

const RECORD_FAILURE = `INSERT INTO announcements (slug, status, attempts, last_error, updated_at)
  VALUES (?1, CASE WHEN 1 >= ?4 THEN 'given_up' ELSE 'pending' END, 1, ?2, ?3)
  ON CONFLICT(slug) DO UPDATE SET
    attempts = attempts + 1,
    status = CASE WHEN attempts + 1 >= ?4 THEN 'given_up' ELSE 'pending' END,
    last_error = excluded.last_error,
    updated_at = excluded.updated_at
  RETURNING status, attempts`;

/**
 * Cron entry point: announces newly published posts to Discord, each slug at most once.
 * Edits never resend (the slug already has a row). Failures are retried on later runs and
 * given up after MAX_ATTEMPTS.
 */
export async function runScheduled(env: Env, scheduledTime: number): Promise<void> {
  if (!env.DISCORD_WEBHOOK_URL) {
    console.warn("[announce] DISCORD_WEBHOOK_URL is not set, skipping");
    return;
  }
  const db = env.FEED_DB;
  const now = scheduledTime;
  const stamp = new Date(now).toISOString();

  const { results } = await db
    .prepare("SELECT slug, status FROM announcements")
    .all<{ slug: string; status: Status }>();
  const rows = new Map(results.map((r) => [r.slug, r.status]));

  const skip: string[] = [];
  const giveUp: string[] = [];
  const candidates = [];
  for (const post of publishedPosts(now)) {
    const status = rows.get(post.slug);
    if (status && status !== "pending") continue;
    if (now - post.dateMs > WINDOW_MS) {
      if (status === "pending") giveUp.push(post.slug);
      else skip.push(post.slug);
    } else {
      candidates.push(post);
    }
  }

  const statements = [
    ...skip.map((slug) => db.prepare(UPSERT).bind(slug, "skipped", stamp)),
    ...giveUp.map((slug) => db.prepare(UPSERT).bind(slug, "given_up", stamp)),
  ];
  if (statements.length) await db.batch(statements);
  for (const slug of giveUp) {
    console.error(`[announce] ${slug}: given up, it left the ${WINDOW_MS / 3_600_000} h window unsent`);
  }

  const toSend = candidates
    .sort((a, b) => a.dateMs - b.dateMs || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
    .slice(0, MAX_PER_RUN);

  let sent = 0;
  let failed = 0;
  for (const post of toSend) {
    const payload = buildWebhookPayload(post, post.project ? (titles.get(post.project) ?? null) : null);
    try {
      await sendWebhook(env.DISCORD_WEBHOOK_URL, payload);
    } catch (err) {
      failed++;
      const message = (err as Error).message.slice(0, 500);
      try {
        const row = await db
          .prepare(RECORD_FAILURE)
          .bind(post.slug, message, stamp, MAX_ATTEMPTS)
          .first<{ status: Status; attempts: number }>();
        const suffix = row?.status === "given_up" ? `, given up after ${row.attempts} attempts` : "";
        console.error(`[announce] ${post.slug}: send failed (${message})${suffix}`);
      } catch (dbErr) {
        console.error(`[announce] ${post.slug}: send failed (${message}), recording failed too`, dbErr);
      }
      continue;
    }
    sent++;
    try {
      await db.prepare(UPSERT).bind(post.slug, "sent", stamp).run();
    } catch (dbErr) {
      // Discord has the message but the row is missing: the next run may send it again.
      console.error(`[announce] ${post.slug}: sent, but recording failed`, dbErr);
    }
  }

  console.info(
    `[announce] sent ${sent}, failed ${failed}, skipped ${skip.length}, given up ${giveUp.length}, ` +
      `waiting ${candidates.length - toSend.length}`,
  );
}
