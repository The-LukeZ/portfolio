<script lang="ts">
  import {
    Astro,
    MongoDB,
    Postgres,
    Supabase,
    Svelte,
    Swift,
    Symfony,
    Tailwind,
    Typescript,
    Vue,
  } from "$lib/assets/index.js";
  import SQLite from "$lib/assets/technologies/SQLite.svelte";
  import Workers from "$lib/assets/technologies/Workers.svelte";
  import { m } from "$lib/paraglide/messages";
  import ExternalLink from "./ExternalLink.svelte";
</script>

<section id="about" class="section about">
  <h2 class="section-title fade-in delay-200">{m["about.title"]()}</h2>
  <div class="about-content">
    <p class="fade-in delay-200">
      {@html m["about.description"]({
        age: "21",
      })}
    </p>
    <h3 class="fade-in delay-200">{m["about.aboutAiTitle"]()}</h3>
    <p class="fade-in delay-200">{m["about.aboutAi"]()}</p>
  </div>

  <h3 class="tech-stack-title fade-in delay-200">{m["about.techstackTitle"]()}</h3>
  <div class="tech-stack">
    <ExternalLink href="https://supabase.com/">
      <Supabase class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://svelte.dev/">
      <Svelte class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://tailwindcss.com/">
      <Tailwind class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://www.typescriptlang.org/">
      <Typescript class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://symfony.com/">
      <Symfony class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://vuejs.org/">
      <Vue class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://www.swift.org/">
      <Swift class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://www.mongodb.com/">
      <MongoDB class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://www.postgresql.org/">
      <Postgres class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://workers.cloudflare.com/">
      <Workers class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://astro.build/">
      <Astro class="fade-in" />
    </ExternalLink>
    <ExternalLink href="https://sqlite.org/">
      <SQLite class="fade-in" />
    </ExternalLink>
  </div>
</section>

<style>
  .about {
    background: var(--color-secondary-bg);
  }

  /* The scroll-margin-top logic can just be inside standard css */
  .about {
    scroll-margin-top: calc(var(--nav-height) + 1rem);
  }

  .about-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .about-content p {
    text-wrap: balance;
    font-size: 1.2rem;
    color: var(--color-text-secondary);
    line-height: 1.8;
  }

  h3 {
    text-align: center;
    margin-top: 2rem;
  }

  .tech-stack {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    gap: 1rem;
  }

  .tech-stack :global(svg) {
    width: 2.5rem;
    height: 2.5rem;
    transition: all 200ms ease-in-out;
  }

  /* Staggering transition delay */
  .tech-stack :global(svg:nth-child(1)) {
    transition-delay: 200ms;
  }
  .tech-stack :global(svg:nth-child(2)) {
    transition-delay: 225ms;
  }
  .tech-stack :global(svg:nth-child(3)) {
    transition-delay: 250ms;
  }
  .tech-stack :global(svg:nth-child(4)) {
    transition-delay: 275ms;
  }
  .tech-stack :global(svg:nth-child(5)) {
    transition-delay: 300ms;
  }
  .tech-stack :global(svg:nth-child(6)) {
    transition-delay: 325ms;
  }
  .tech-stack :global(svg:nth-child(7)) {
    transition-delay: 350ms;
  }
  .tech-stack :global(svg:nth-child(8)) {
    transition-delay: 375ms;
  }
  .tech-stack :global(svg:nth-child(9)) {
    transition-delay: 400ms;
  }
  .tech-stack :global(svg:nth-child(10)) {
    transition-delay: 425ms;
  }
  .tech-stack :global(svg:nth-child(11)) {
    transition-delay: 450ms;
  }
  .tech-stack :global(svg:nth-child(12)) {
    transition-delay: 475ms;
  }
</style>
