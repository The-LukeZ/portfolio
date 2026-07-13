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

  let descExpanded = $state(false);
  let aiExpanded = $state(false);
</script>

<section id="about" class="section about">
  <h2 class="section-title fade-in delay-200">{m["about.title"]()}</h2>
  <div class="about-content">
    <div class="collapsible fade-in delay-200" class:expanded={descExpanded}>
      <p>
        {@html m["about.description"]({
          age: "21",
        })}
      </p>
    </div>
    <button
      type="button"
      class="toggle-btn fade-in delay-200"
      aria-expanded={descExpanded}
      onclick={() => (descExpanded = !descExpanded)}
    >
      {descExpanded ? m["about.showLess"]() : m["about.showMore"]()}
    </button>

    <h3 class="fade-in delay-200">{m["about.aboutAiTitle"]()}</h3>
    <div class="collapsible fade-in delay-200" class:expanded={aiExpanded}>
      <p>{m["about.aboutAi"]()}</p>
    </div>
    <button
      type="button"
      class="toggle-btn fade-in delay-200"
      aria-expanded={aiExpanded}
      onclick={() => (aiExpanded = !aiExpanded)}
    >
      {aiExpanded ? m["about.showLess"]() : m["about.showMore"]()}
    </button>
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
    margin: 0;
  }

  .collapsible {
    position: relative;
    max-height: 7.2rem; /* ~4 lines at line-height 1.8 */
    overflow: hidden;
    transition: max-height 300ms ease-in-out;
  }

  .collapsible.expanded {
    max-height: 100rem;
  }

  /* Fade-out mask while collapsed */
  .collapsible::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 3rem;
    background: linear-gradient(to bottom, transparent, var(--color-primary-bg));
    pointer-events: none;
    opacity: 1;
    transition: opacity 200ms ease-in-out;
  }

  .collapsible.expanded::after {
    opacity: 0;
  }

  .toggle-btn {
    margin-top: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-accent);
    padding: 0.25rem 0.5rem;
  }

  .toggle-btn:hover {
    text-decoration: underline;
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
