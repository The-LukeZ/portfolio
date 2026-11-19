<script lang="ts">
  import About from "#lib/components/About.svelte";
  import Footer from "#lib/components/Footer.svelte";
  import Header from "#lib/components/Header.svelte";
  import Hero from "#lib/components/Hero.svelte";
  import Projects from "#lib/components/Projects.svelte";
  import Social from "#lib/components/Social.svelte";
  import { m } from "#lib/paraglide/messages.js";
  import { localizeHref } from "#lib/paraglide/runtime.js";
</script>

<svelte:head>
  <title>LukeZ Development</title>
  <meta name="description" content={m["seo.description"]()} />
  <meta name="keywords" content={m["seo.keywords"]()} />
  <meta name="og:description" content={m["seo.description"]()} />
  <!-- OG Tags -->
  <meta property="og:title" content="LukeZ Portfolio" />
  <meta property="og:image" content="https://thelukez.com/LukeZ.webp" />
  <meta property="og:url" content="https://thelukez.com/" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="LukeZ Development" />
  <!-- Canonical URL -->
  <link rel="canonical" href="https://thelukez.com/" />
</svelte:head>

<Header showLogo={false} />

<main>
  <Hero />
  <Projects />
  <p class="feed-link">
    <a href={localizeHref("/feed")}>{m["home.feedLink"]()} &rarr;</a>
  </p>
  <About />
  <Social />
</main>

<Footer />

<style>
  .feed-link {
    max-width: var(--max-width);
    margin: 0 auto 3rem;
    padding: 0 1.5rem;
    font-weight: 700;
  }
</style>
