import { redirect } from "@sveltejs/kit";
import { env } from "cloudflare:workers";
import { authorizeUrl, COOKIE_PATH, STATE_COOKIE } from "#lib/server/cms-auth.js";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = ({ url, cookies }) => {
  const state = crypto.randomUUID();
  cookies.set(STATE_COOKIE, state, {
    path: COOKIE_PATH,
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    maxAge: 600,
  });
  redirect(302, authorizeUrl(env.GITHUB_CLIENT_ID, url.origin, state), { external: ["https://github.com"] });
};
