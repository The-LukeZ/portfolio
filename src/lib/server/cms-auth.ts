/**
 * GitHub OAuth for Sveltia CMS (/admin). The CMS opens /api/cms/auth in a popup; GitHub
 * redirects back to /api/cms/callback, which exchanges the code for a token and hands it to
 * the CMS window with the Decap/Sveltia popup handshake.
 */

export const STATE_COOKIE = "cms_oauth_state";
export const COOKIE_PATH = "/api/cms";

export function authorizeUrl(clientId: string, origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "public_repo",
    state,
    redirect_uri: `${origin}/api/cms/callback`,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

/** JSON that is safe inside a <script> element. */
const scriptJson = (value: unknown) => JSON.stringify(value).replaceAll("<", "\\u003c");

/**
 * The popup page: announces itself to the CMS window ("authorizing:github"), waits for the echo
 * and then posts the result. Messages only ever go to `origin`, never "*".
 */
export function callbackHtml(origin: string, result: { token: string } | { error: string }): string {
  const status = "token" in result ? "success" : "error";
  const payload = "token" in result ? { token: result.token, provider: "github" } : result;
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Signing in…</title></head>
<body>
<p>${status === "success" ? "Signed in, you can close this window." : "Sign-in failed, you can close this window."}</p>
<script>
(() => {
  const origin = ${scriptJson(origin)};
  const message = "authorization:github:" + ${scriptJson(status)} + ":" + JSON.stringify(${scriptJson(payload)});
  if (!window.opener) return;
  window.addEventListener("message", (e) => {
    if (e.origin !== origin || e.data !== "authorizing:github") return;
    window.opener.postMessage(message, origin);
    window.close();
  });
  window.opener.postMessage("authorizing:github", origin);
})();
</script>
</body>
</html>`;
}

/** Exchanges an OAuth code for an access token. Throws with GitHub's error description on failure. */
export async function exchangeCode(clientId: string, clientSecret: string, code: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
  const data = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!data.access_token) throw new Error(data.error_description ?? data.error ?? "No access token returned");
  return data.access_token;
}
