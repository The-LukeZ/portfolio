<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Navigation from "$lib/components/Navigation.svelte";
  import BusinessHero from "$lib/components/business/BusinessHero.svelte";
  import Imprint from "$lib/components/business/Imprint.svelte";
  import { m } from "$lib/paraglide/messages";
</script>

<svelte:head>
  <title>LukeZ Development by Luca Hentschel</title>

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

<Navigation />

<main class="business-page">
  <BusinessHero />
  <Imprint />
</main>

<Footer />

<style>
  .business-page {
    min-height: calc(100vh - var(--nav-height));
  }
</style>
