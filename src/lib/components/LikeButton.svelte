<script lang="ts">
  import { TURNSTILE_SITE_KEY } from "$app/env/public";
  import type { LikeState } from "#lib/feed.ts";
  import { m } from "#lib/paraglide/messages.js";
  import { getTurnstileToken } from "#lib/turnstile.ts";
  import Heart from "@lucide/svelte/icons/heart";

  let { slug }: { slug: string } = $props();

  let likes = $state.raw<LikeState | null>(null);
  let busy = $state(false);
  let message = $state("");
  let challengeBox: HTMLDivElement;

  const url = $derived(`/api/feed/likes/${slug}`);

  // The page HTML is publicly cached, so the per-device state is fetched here.
  $effect(() => {
    const controller = new AbortController();
    fetch(url, { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<LikeState>) : null))
      .then((s) => {
        if (s) likes = s;
      })
      .catch(() => {});
    return () => controller.abort();
  });

  async function like(current: LikeState): Promise<Response> {
    const token = current.verified ? undefined : await getTurnstileToken(challengeBox, TURNSTILE_SITE_KEY);
    return fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
  }

  async function toggle() {
    if (!likes || busy) return;
    busy = true;
    message = "";
    try {
      let res: Response;
      if (likes.liked) {
        res = await fetch(url, { method: "DELETE" });
      } else {
        res = await like(likes);
        if (res.status === 403 && likes.verified) {
          // Cookie expired or the secret rotated: run the challenge once.
          likes = { ...likes, verified: false };
          res = await like(likes);
        }
      }
      if (res.ok) likes = (await res.json()) as LikeState;
      else message = res.status === 429 ? m["feed.like.limited"]() : m["feed.like.error"]();
    } catch {
      message = m["feed.like.error"]();
    } finally {
      busy = false;
    }
  }
</script>

<div class="like">
  <button
    type="button"
    class={["like-button", likes?.liked && "liked"]}
    aria-pressed={likes?.liked ?? false}
    aria-label={likes?.liked ? m["feed.like.unlike"]() : m["feed.like.label"]()}
    disabled={!likes || busy}
    onclick={toggle}
  >
    <Heart aria-hidden="true" />
    <span class="count mono">{likes ? m["feed.like.count"]({ count: likes.count }) : ""}</span>
  </button>
  <div class="challenge" bind:this={challengeBox}></div>
  <p class="message" aria-live="polite">{message}</p>
</div>

<style>
  .like {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 3rem;
  }

  .like-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.7rem;
    background: var(--steel-1);
    border: 1px solid var(--steel-edge);
    border-radius: 2px;
    color: var(--ink-2);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
  }

  .like-button:hover:not(:disabled) {
    color: var(--ink);
  }

  .like-button:disabled {
    cursor: default;
  }

  .like-button.liked {
    background: var(--label);
    border-color: var(--label);
    color: var(--label-ink);
  }

  .like-button :global(svg) {
    width: 1rem;
    height: 1rem;
  }

  .like-button.liked :global(svg) {
    fill: currentColor;
  }

  /* Reserve room for counts up to 4 digits, so loading the state does not shift the layout. */
  .count {
    min-width: 4ch;
    text-align: left;
  }

  .challenge:empty,
  .message:empty {
    display: none;
  }

  .message {
    font-size: 0.875rem;
    color: var(--ink-2);
  }

  @media (prefers-reduced-motion: no-preference) {
    .like-button {
      transition:
        color 150ms var(--ease-out),
        background-color 150ms var(--ease-out),
        border-color 150ms var(--ease-out);
    }
  }
</style>
