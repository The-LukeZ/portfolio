/**
 * Feed likes: one like per post per device. A device is an HMAC-signed id in an HttpOnly cookie,
 * issued only after a passed Turnstile challenge. A per-IP daily cap (keyed hash, never the raw IP)
 * limits likes from clearing cookies.
 */
import type { LikeState } from "#lib/feed.ts";

export const DEVICE_COOKIE = "feed_device";
export const COOKIE_PATH = "/api/feed/likes";
/** Max new likes per post per IP hash per UTC day. */
export const IP_DAILY_LIMIT = 5;

const encoder = new TextEncoder();

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function toBase64url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) return null;
  try {
    const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

async function sign(secret: string, message: string): Promise<string> {
  return toBase64url(await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(message)));
}

/** Cookie value `<id>.<base64url(HMAC(secret, "device:" + id))>`. */
export async function signDevice(secret: string, id: string): Promise<string> {
  return `${id}.${await sign(secret, `device:${id}`)}`;
}

/** Device id from a cookie value, or null when missing, malformed or wrongly signed. */
export async function readDevice(secret: string, cookie: string | undefined): Promise<string | null> {
  if (!cookie) return null;
  const dot = cookie.indexOf(".");
  if (dot <= 0) return null;
  const id = cookie.slice(0, dot);
  const sig = fromBase64url(cookie.slice(dot + 1));
  if (!sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), sig, encoder.encode(`device:${id}`));
  return ok ? id : null;
}

/** Keyed hash of the client IP, salted with the UTC day. */
export function hashIp(secret: string, ip: string, day: string): Promise<string> {
  return sign(secret, `ip:${day}:${ip}`);
}

/** UTC date as YYYY-MM-DD. */
export function utcDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export async function likeState(db: D1Database, slug: string, device: string | null): Promise<LikeState> {
  const count = await db
    .prepare("SELECT COUNT(*) AS n FROM likes WHERE slug = ?")
    .bind(slug)
    .first<number>("n");
  const liked = device
    ? (await db
        .prepare("SELECT 1 FROM likes WHERE slug = ? AND device_id = ?")
        .bind(slug, device)
        .first()) !== null
    : false;
  return { count: count ?? 0, liked, verified: device !== null };
}

/** Adds a like. An existing like counts as "ok" without touching the IP cap. */
export async function addLike(
  db: D1Database,
  slug: string,
  device: string,
  ipHash: string,
  day: string,
): Promise<"ok" | "limited"> {
  const existing = await db
    .prepare("SELECT 1 FROM likes WHERE slug = ? AND device_id = ?")
    .bind(slug, device)
    .first();
  if (existing) return "ok";
  const fromIp = await db
    .prepare("SELECT COUNT(*) AS n FROM likes WHERE slug = ? AND ip_hash = ? AND day = ?")
    .bind(slug, ipHash, day)
    .first<number>("n");
  if ((fromIp ?? 0) >= IP_DAILY_LIMIT) return "limited";
  await db
    .prepare("INSERT OR IGNORE INTO likes (slug, device_id, ip_hash, day, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(slug, device, ipHash, day, new Date().toISOString())
    .run();
  return "ok";
}

export async function removeLike(db: D1Database, slug: string, device: string): Promise<void> {
  await db.prepare("DELETE FROM likes WHERE slug = ? AND device_id = ?").bind(slug, device).run();
}
