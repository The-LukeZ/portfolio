/** Client-side Cloudflare Turnstile: loads the script on first use and runs an invisible challenge. */

interface TurnstileOptions {
  sitekey: string;
  execution: "render" | "execute";
  appearance: "always" | "execute" | "interaction-only";
  callback: (token: string) => void;
  "error-callback": () => void;
  "timeout-callback": () => void;
}

interface Turnstile {
  render(container: HTMLElement, options: TurnstileOptions): string | undefined;
  execute(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<Turnstile> | undefined;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile missing"));
    script.onerror = () => {
      // Allow a later retry, e.g. after an ad blocker is turned off.
      loading = undefined;
      script.remove();
      reject(new Error("turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** Runs a Turnstile challenge in `container` and resolves with its token. Shows UI only if interaction is needed. */
export async function getTurnstileToken(container: HTMLElement, siteKey: string): Promise<string> {
  const turnstile = await loadTurnstile();
  return new Promise<string>((resolve, reject) => {
    let id: string | undefined;
    const settle = (fn: () => void) => {
      fn();
      if (id !== undefined) turnstile.remove(id);
    };
    id = turnstile.render(container, {
      sitekey: siteKey,
      execution: "execute",
      appearance: "interaction-only",
      callback: (token) => settle(() => resolve(token)),
      "error-callback": () => settle(() => reject(new Error("turnstile error"))),
      "timeout-callback": () => settle(() => reject(new Error("turnstile timeout"))),
    });
    if (id === undefined) reject(new Error("turnstile render failed"));
    else turnstile.execute(id);
  });
}
