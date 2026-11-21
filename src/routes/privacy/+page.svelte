<script lang="ts">
  import Footer from "#lib/components/Footer.svelte";
  import Header from "#lib/components/Header.svelte";
  import PrivacyDe from "#lib/components/privacy/PrivacyDe.svelte";
  import PrivacyEn from "#lib/components/privacy/PrivacyEn.svelte";
  import { m } from "#lib/paraglide/messages.js";
  import { getLocale } from "#lib/paraglide/runtime.js";
</script>

<svelte:head>
  <title>{m["footerNav.privacy"]()} | LukeZ</title>
  <link rel="canonical" href={`https://thelukez.com${getLocale() === "de" ? "/de" : ""}/privacy`} />
</svelte:head>

<Header />

<main class="privacy-page">
  <article class="wrap selectable">
    {#if getLocale() === "de"}
      <PrivacyDe />
    {:else}
      <PrivacyEn />
    {/if}
  </article>
</main>

<Footer />

<style>
  .privacy-page {
    min-height: calc(100vh - var(--nav-height));
  }

  .wrap {
    max-width: 46rem;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
    font-size: 1rem;
    line-height: 1.7;
    color: var(--ink);
  }

  .wrap :global(h1) {
    font-size: clamp(1.75rem, 2.6vw, 2.5rem);
    font-weight: 800;
    font-stretch: 72%;
    line-height: 1.05;
    letter-spacing: -0.005em;
    text-transform: uppercase;
  }

  .wrap :global(.updated) {
    margin: 0.5rem 0 2rem;
    font-size: 0.875rem;
    color: var(--ink-3);
  }

  .wrap :global(h2) {
    margin: 2rem 0 0.75rem;
    font-size: 1.25rem;
    font-weight: 800;
    font-stretch: 75%;
    line-height: 1.15;
  }

  .wrap :global(:where(p, ul)) {
    margin-bottom: 1rem;
  }

  .wrap :global(ul) {
    padding-left: 1.5rem;
  }

  .wrap :global(li + li) {
    margin-top: 0.5rem;
  }

  .wrap :global(a) {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .wrap :global(code) {
    padding: 0.1em 0.35em;
    background: var(--steel-2);
    border-radius: 2px;
    font-family: var(--font-mono);
    font-size: 0.9em;
  }
</style>
