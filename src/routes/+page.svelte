<script lang="ts">
  import { browser } from "$app/environment";
  import About from "$lib/components/About.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import Projects from "$lib/components/Projects.svelte";
  import Social from "$lib/components/Social.svelte";
  import { m } from "$lib/paraglide/messages";

  let observedElements: HTMLElement[] = [];

  $effect(() => {
    if (browser) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
            }
          });
        },
        { threshold: 0.1 },
      );

      observedElements.push(
        ...(document.querySelectorAll(".fade-in, .scale-up, .in-view") as NodeListOf<HTMLElement>),
      );
      observedElements.forEach((el) => {
        if (el) {
          observer.observe(el);
        }
      });

      return () => {
        observedElements.forEach((el) => {
          if (el) {
            observer.unobserve(el);
          }
        });
      };
    }
  });
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

<Header />

<main>
  <Hero />
  <About />
  <Projects />
  <Social />
</main>

<Footer />
