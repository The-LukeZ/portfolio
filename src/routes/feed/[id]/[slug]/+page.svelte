<script lang="ts">
  import Footer from "#lib/components/Footer.svelte";
  import Header from "#lib/components/Header.svelte";
  import KofiCta from "#lib/components/KofiCta.svelte";
  import LocalTime from "#lib/components/LocalTime.svelte";
  import { m } from "#lib/paraglide/messages.js";
  import { getLocale, localizeHref } from "#lib/paraglide/runtime.js";
  import { projectsByLocale } from "#lib/projects/index.js";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import type { Attachment } from "svelte/attachments";

  let { data } = $props();
  const post = $derived(data.post);

  // Kept in sync with SITE_URL/postUrl in #lib/server/feed (server-only module).
  const url = $derived(`https://thelukez.com/feed/${post.slug}`);
  const image = $derived(post.image?.src ?? "https://thelukez.com/LukeZ.webp");
  const project = $derived(
    post.project ? projectsByLocale[getLocale()].find((p) => p.id === post.project) : undefined,
  );

  // Opens links to other origins in a new tab. Delegated, so it covers the {@html} body.
  const externalLinksInNewTab: Attachment<HTMLElement> = (node) => {
    function onclick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.origin === location.origin) return;
      // Set before the default action runs, so the browser opens it in a new tab.
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    node.addEventListener("click", onclick);
    return () => node.removeEventListener("click", onclick);
  };
</script>

<svelte:head>
  <title>{post.title} | LukeZ</title>
  <meta name="description" content={post.summary} />
  <link rel="canonical" href={url} />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.summary} />
  <meta property="og:image" content={image} />
  {#if post.image}
    <meta property="og:image:alt" content={post.image.alt} />
  {/if}
  <meta property="og:url" content={url} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="LukeZ Development" />
  <meta property="article:published_time" content={post.date} />
  {#if post.updated}
    <meta property="article:modified_time" content={post.updated} />
  {/if}
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Header />

<main class="post-page">
  <article class="wrap">
    <a class="back" href={localizeHref("/feed")}><ArrowLeft aria-hidden="true" /> {m["feed.back"]()}</a>

    <header class="post-head">
      <p class="meta mono">
        <LocalTime iso={post.date} />
        {#if post.updated}
          <span>{m["feed.updated"]()} <LocalTime iso={post.updated} /></span>
        {/if}
      </p>
      <h1 class="selectable">{post.title}</h1>
      {#if project}
        <p class="project">
          {m["feed.project"]()}:
          <a href={project.link} target="_blank" rel="noopener">{project.title}</a>
        </p>
      {/if}
    </header>

    {#if post.image}
      <img class="cover" src={post.image.src} alt={post.image.alt} />
    {/if}

    <div class="prose selectable" {@attach externalLinksInNewTab}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered at build time from our own posts, raw HTML escaped -->
      {@html post.html}
    </div>

    <KofiCta />
  </article>
</main>

<Footer />

<style>
  .post-page {
    min-height: calc(100vh - var(--nav-height));
  }

  .wrap {
    max-width: 46rem;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .back :global(svg) {
    width: 1.125rem;
    height: 1.125rem;
  }

  .post-head {
    margin-bottom: 2rem;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    font-size: 0.75rem;
    color: var(--ink-3);
  }

  h1 {
    margin-top: 0.5rem;
    font-size: clamp(1.75rem, 2.6vw, 2.5rem);
    font-weight: 800;
    font-stretch: 72%;
    line-height: 1.05;
    letter-spacing: -0.005em;
    text-transform: uppercase;
  }

  .project {
    margin-top: 0.75rem;
    color: var(--ink-2);
  }

  .cover {
    display: block;
    width: 100%;
    height: auto;
    margin-bottom: 2rem;
    border: 1px solid var(--steel-edge);
    border-radius: 3px;
  }

  .prose {
    margin-bottom: 3rem;
    font-size: 1.0625rem;
    line-height: 1.7;
    color: var(--ink);
  }

  .prose :global(:where(p, ul, ol, pre, table, blockquote, img)) {
    margin-bottom: 1.25rem;
  }

  .prose :global(:where(h1, h2, h3, h4)) {
    margin: 2rem 0 0.75rem;
    font-weight: 800;
    font-stretch: 75%;
    line-height: 1.15;
  }

  .prose :global(h1),
  .prose :global(h2) {
    font-size: 1.5rem;
  }

  .prose :global(h3) {
    font-size: 1.25rem;
  }

  .prose :global(:where(ul, ol)) {
    padding-left: 1.5rem;
  }

  .prose :global(a) {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .prose :global(img) {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 3px;
  }

  .prose :global(blockquote) {
    padding-left: 1rem;
    border-left: 2px solid var(--label);
    color: var(--ink-2);
  }

  .prose :global(:not(pre) > code) {
    padding: 0.1em 0.35em;
    background: var(--steel-2);
    border-radius: 2px;
    font-family: var(--font-mono);
    font-size: 0.9em;
  }

  .prose :global(pre) {
    padding: 1rem;
    overflow-x: auto;
    border: 1px solid var(--steel-edge);
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* The global `*` rule in app.css sets the sans font on every element, so Shiki's spans need it reset. */
  .prose :global(pre *) {
    font-family: inherit;
  }

  .prose :global(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }

  .prose :global(:where(th, td)) {
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--steel-edge);
    text-align: left;
  }

  .prose :global(th) {
    background: var(--steel-2);
  }

  .prose :global(hr) {
    margin: 2rem 0;
    border: 0;
    border-top: 1px solid var(--steel-edge);
  }
</style>
