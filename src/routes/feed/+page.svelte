<script lang="ts">
  import { browser } from "$app/env";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Footer from "#lib/components/Footer.svelte";
  import Header from "#lib/components/Header.svelte";
  import KofiCta from "#lib/components/KofiCta.svelte";
  import LocalTime from "#lib/components/LocalTime.svelte";
  import { applyFilter, filterOptions, GENERAL, type FeedListItem } from "#lib/feed.js";
  import { m } from "#lib/paraglide/messages.js";
  import { getLocale, localizeHref } from "#lib/paraglide/runtime.js";
  import { projectsByLocale } from "#lib/projects/index.js";
  import { onMount } from "svelte";
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";
  import { prefersReducedMotion } from "svelte/motion";
  import { fade } from "svelte/transition";

  let status = $state<"loading" | "ready" | "error">("loading");
  let items = $state<FeedListItem[]>([]);

  onMount(async () => {
    try {
      const res = await fetch("/feed/posts.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      items = await res.json();
      status = "ready";
    } catch {
      status = "error";
    }
  });

  const projects = $derived(projectsByLocale[getLocale()]);
  const projectTitle = (id: string) => projects.find((p) => p.id === id)?.title ?? id;

  // The list page is prerendered: search params only exist in the browser.
  const filter = $derived(browser ? page.url.searchParams.get("project") : null);
  const options = $derived(
    filterOptions(
      items,
      projects.map((p) => p.id),
    ),
  );
  const shown = $derived(applyFilter(items, filter));

  // Svelte transitions ignore the media query on their own.
  const motion = $derived(prefersReducedMotion.current ? 0 : 1);

  function setFilter(value: string | null) {
    const url = new URL(page.url.href);
    if (value === null) url.searchParams.delete("project");
    else url.searchParams.set("project", value);
    goto(url, { reset: false });
  }
</script>

<svelte:head>
  <title>{m["feed.title"]()} | LukeZ</title>
  <meta name="description" content={m["feed.subtitle"]()} />
  <link rel="canonical" href="https://thelukez.com/feed" />
  <meta property="og:title" content="{m['feed.title']()} | LukeZ" />
  <meta property="og:description" content={m["feed.subtitle"]()} />
  <meta property="og:image" content="https://thelukez.com/LukeZ.webp" />
  <meta property="og:url" content="https://thelukez.com/feed" />
  <meta property="og:type" content="website" />
  <!-- Without JS the posts never load: hide the placeholders, the noscript notice explains. -->
  <noscript
    ><style>
      .feed-loading {
        display: none;
      }
    </style></noscript
  >
</svelte:head>

<Header />

<main class="feed-page">
  <div class="wrap">
    <header class="intro">
      <h1>{m["feed.title"]()}</h1>
      <p>{m["feed.subtitle"]()}</p>
      <a class="rss" href="/feed.xml">{m["feed.rss"]()}</a>
    </header>

    <noscript>
      <p class="notice">
        {m["feed.noscript"]()} <a href="/feed.xml">/feed.xml</a>
      </p>
    </noscript>

    <!-- Placeholders have the same boxes as the real filters and post, so nothing shifts when they load. -->
    {#if status === "loading"}
      <div class="filters feed-loading" aria-hidden="true">
        <span class="bar pill-bar"></span>
        <span class="bar pill-bar wide"></span>
      </div>
    {:else if status === "ready" && items.length > 0 && options.length > 0}
      <div class="filters appear" role="group" aria-label={m["feed.filter.label"]()}>
        <button type="button" aria-pressed={filter === null} onclick={() => setFilter(null)}>
          {m["feed.filter.all"]()}
        </button>
        {#each options as option (option)}
          <button type="button" aria-pressed={filter === option} onclick={() => setFilter(option)}>
            {option === GENERAL ? m["feed.filter.general"]() : projectTitle(option)}
          </button>
        {/each}
      </div>
    {/if}

    {#if status === "loading"}
      <div class="feed-loading" aria-busy="true">
        <p class="sr-only" role="status">{m["feed.loading"]()}</p>
        <ol class="posts" aria-hidden="true">
          <li class="post">
            <span class="bar meta-bar"></span>
            <span class="bar title-bar"></span>
            <span class="bar summary-bar"></span>
            <span class="bar summary-bar short"></span>
          </li>
        </ol>
      </div>
    {:else if status === "error"}
      <p class="notice appear" role="alert">{m["feed.loadError"]()}</p>
    {:else if status === "ready"}
      {#if items.length === 0}
        <p class="notice appear">{m["feed.empty"]()}</p>
      {:else}
        {#if shown.length === 0}
          <p class="notice appear">
            {m["feed.emptyFilter"]()}
            <a href={localizeHref("/feed")} onclick={(e) => (e.preventDefault(), setFilter(null))}>
              {m["feed.resetFilter"]()}
            </a>
          </p>
        {:else}
          <!-- Removed posts leave at once (an outro would hold their space), the rest slide into place. -->
          <ol class="posts appear" role="list">
            {#each shown as item (item.slug)}
              <li
                class="post"
                animate:flip={{ duration: 250 * motion, easing: cubicOut }}
                in:fade={{ duration: 200 * motion, delay: 100 * motion }}
              >
                <p class="meta mono">
                  <LocalTime iso={item.date} />
                  <span>{item.project ? projectTitle(item.project) : m["feed.filter.general"]()}</span>
                </p>
                <h2><a href={localizeHref(`/feed/${item.slug}`)}>{item.title}</a></h2>
                <p class="summary">{item.summary}</p>
              </li>
            {/each}
          </ol>
        {/if}
      {/if}
    {/if}

    <KofiCta />
  </div>
</main>

<Footer />

<style>
  .feed-page {
    min-height: calc(100vh - var(--nav-height));
  }

  .wrap {
    max-width: 46rem;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  .intro {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: clamp(1.75rem, 2.6vw, 2.5rem);
    font-weight: 800;
    font-stretch: 72%;
    line-height: 1.05;
    letter-spacing: -0.005em;
    text-transform: uppercase;
  }

  .intro p {
    margin-top: 0.5rem;
    color: var(--ink-2);
  }

  .rss {
    display: inline-block;
    margin-top: 0.5rem;
    font-weight: 600;
  }

  .notice {
    margin-bottom: 2rem;
    padding: 1rem 1.25rem;
    background: var(--steel-2);
    border: 1px solid var(--steel-edge);
    border-radius: 3px;
    color: var(--ink-2);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .filters button {
    padding: 0.3rem 0.7rem;
    background: var(--steel-1);
    border: 1px solid var(--steel-edge);
    border-radius: 2px;
    color: var(--ink-2);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      color 150ms var(--ease-out),
      background-color 150ms var(--ease-out),
      border-color 150ms var(--ease-out);
  }

  .filters button:hover {
    color: var(--ink);
  }

  .filters button[aria-pressed="true"] {
    background: var(--label);
    border-color: var(--label);
    color: var(--label-ink);
  }

  .posts {
    list-style: none;
    display: grid;
    gap: 0.5rem;
    margin-bottom: 3rem;
  }

  .post {
    padding: 1rem 1.25rem 1.25rem;
    background: var(--steel-3);
    border-radius: 3px;
    box-shadow:
      inset 0 1px 0 var(--steel-hi),
      inset 0 -5px 0 var(--steel-1),
      0 2px 3px oklch(0% 0 0 / 0.35);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    font-size: 0.75rem;
    color: var(--ink-3);
  }

  h2 {
    margin-top: 0.25rem;
    font-size: 1.25rem;
    font-weight: 800;
    font-stretch: 75%;
    line-height: 1.2;
  }

  h2 a {
    color: var(--ink);
  }

  h2 a:hover {
    opacity: 1;
    color: var(--label);
  }

  .summary {
    margin-top: 0.375rem;
    color: var(--ink-2);
  }

  .bar {
    display: block;
    border-radius: 2px;
    background: var(--steel-hi);
    opacity: 0.45;
  }

  /* Heights match the line boxes of .meta (0.75rem), h2 (1.25rem) and .summary (1rem). */
  .meta-bar {
    width: 9rem;
    height: calc(0.75rem * 1.6);
  }

  .title-bar {
    width: 60%;
    height: calc(1.25rem * 1.2);
    margin-top: 0.25rem;
  }

  /* Two summary lines: most summaries wrap once. Each bar is shorter than its line box, the margins fill the rest. */
  .summary-bar {
    width: 90%;
    height: 1rem;
    margin-top: calc(0.375rem + 0.3rem);
  }

  .summary-bar.short {
    width: 55%;
    margin-top: 0.6rem;
    margin-bottom: 0.3rem;
  }

  /* Same box as a filter button: 0.875rem text at line-height 1.6, 0.3rem padding, 1px border. */
  .pill-bar {
    width: 2.75rem;
    height: calc(0.875rem * 1.6 + 0.6rem + 2px);
  }

  .pill-bar.wide {
    width: 5.5rem;
  }

  @media (prefers-reduced-motion: no-preference) {
    .bar {
      animation: pulse 1.4s ease-in-out infinite;
    }

    /* Content replacing a placeholder (or another notice) fades in where the placeholder was. */
    .appear {
      animation: appear 250ms var(--ease-out);
    }
  }

  @keyframes appear {
    from {
      opacity: 0;
    }
  }

  @keyframes pulse {
    50% {
      opacity: 0.2;
    }
  }
</style>
