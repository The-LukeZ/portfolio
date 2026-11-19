import { env } from "cloudflare:workers";
import { callbackHtml, COOKIE_PATH, exchangeCode, STATE_COOKIE } from "#lib/server/cms-auth.js";

export const prerender = false;

export const GET = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = cookies.get(STATE_COOKIE);
  cookies.delete(STATE_COOKIE, { path: COOKIE_PATH });

  const respond = (status: number, result: { token: string } | { error: string }) =>
    new Response(callbackHtml(url.origin, result), {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
      },
    });

  if (!code || !state || !expected || state !== expected) {
    return respond(400, { error: "Invalid or expired sign-in attempt. Please try again." });
  }
  try {
    return respond(200, { token: await exchangeCode(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, code) });
  } catch (err) {
    return respond(502, { error: `GitHub sign-in failed: ${(err as Error).message}` });
  }
};
