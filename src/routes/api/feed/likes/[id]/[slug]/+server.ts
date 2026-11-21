import { error, json } from "@sveltejs/kit";
import { env } from "cloudflare:workers";
import { publishedPost } from "#lib/server/feed/index.js";
import {
  addLike,
  COOKIE_PATH,
  DEVICE_COOKIE,
  hashIp,
  likeState,
  readDevice,
  removeLike,
  signDevice,
  utcDay,
} from "#lib/server/feed/likes.js";
import { verifyTurnstile } from "#lib/server/turnstile.js";

export const prerender = false;

const NO_STORE = { "cache-control": "no-store" };

function postSlug(params: { id: string; slug: string }): string {
  const slug = `${params.id}/${params.slug}`;
  if (!publishedPost(slug)) error(404, "Not found");
  return slug;
}

function challenge() {
  return json({ error: "challenge" }, { status: 403, headers: NO_STORE });
}

export const GET = async ({ params, cookies }) => {
  const slug = postSlug(params);
  const device = await readDevice(env.LIKE_SECRET, cookies.get(DEVICE_COOKIE));
  return json(await likeState(env.FEED_DB, slug, device), { headers: NO_STORE });
};

export const POST = async ({ params, cookies, request, url, getClientAddress }) => {
  const slug = postSlug(params);
  const ip = getClientAddress();
  let device = await readDevice(env.LIKE_SECRET, cookies.get(DEVICE_COOKIE));
  if (!device) {
    const body: unknown = await request.json().catch(() => ({}));
    const token =
      body && typeof body === "object" && "token" in body && typeof body.token === "string" ? body.token : "";
    if (!token || !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, ip))) return challenge();
    device = crypto.randomUUID();
  }
  const day = utcDay();
  const result = await addLike(env.FEED_DB, slug, device, await hashIp(env.LIKE_SECRET, ip, day), day);
  if (result === "limited") return json({ error: "limited" }, { status: 429, headers: NO_STORE });
  // Set on every successful like so the one-year lifetime slides.
  cookies.set(DEVICE_COOKIE, await signDevice(env.LIKE_SECRET, device), {
    path: COOKIE_PATH,
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return json(await likeState(env.FEED_DB, slug, device), { headers: NO_STORE });
};

export const DELETE = async ({ params, cookies }) => {
  const slug = postSlug(params);
  const device = await readDevice(env.LIKE_SECRET, cookies.get(DEVICE_COOKIE));
  if (!device) return challenge();
  await removeLike(env.FEED_DB, slug, device);
  return json(await likeState(env.FEED_DB, slug, device), { headers: NO_STORE });
};
