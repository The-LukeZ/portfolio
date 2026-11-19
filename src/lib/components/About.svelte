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
  } from "#lib/assets/index.js";
  import SQLite from "#lib/assets/technologies/SQLite.svelte";
  import Workers from "#lib/assets/technologies/Workers.svelte";
  import { m } from "#lib/paraglide/messages.js";

  const tech = [
    { name: "Svelte", href: "https://svelte.dev/", icon: Svelte },
    { name: "TypeScript", href: "https://www.typescriptlang.org/", icon: Typescript },
    { name: "Cloudflare Workers", href: "https://workers.cloudflare.com/", icon: Workers },
    { name: "Supabase", href: "https://supabase.com/", icon: Supabase },
    { name: "Tailwind CSS", href: "https://tailwindcss.com/", icon: Tailwind },
    { name: "Vue", href: "https://vuejs.org/", icon: Vue },
    { name: "Astro", href: "https://astro.build/", icon: Astro },
    { name: "Symfony", href: "https://symfony.com/", icon: Symfony },
    { name: "Swift", href: "https://www.swift.org/", icon: Swift },
    { name: "PostgreSQL", href: "https://www.postgresql.org/", icon: Postgres },
    { name: "SQLite", href: "https://sqlite.org/", icon: SQLite },
    { name: "MongoDB", href: "https://www.mongodb.com/", icon: MongoDB },
  ];
</script>

<section id="about" class="about" aria-labelledby="about-title">
  <div class="text">
    <h2 id="about-title">{m["about.title"]()}</h2>
    <p>
      {@html m["about.description"]({
        age: "21",
      })}
    </p>

    <details class="ai">
      <summary>{m["about.aboutAiTitle"]()}</summary>
      <p>{m["about.aboutAi"]()}</p>
    </details>
  </div>

  <aside class="tech" aria-labelledby="tech-title">
    <h3 id="tech-title">{m["about.techstackTitle"]()}</h3>
    <ul role="list">
      {#each tech as t (t.name)}
        <li>
          <a href={t.href} target="_blank" rel="noopener noreferrer" title={t.name}>
            <t.icon />
            <span>{t.name}</span>
          </a>
        </li>
      {/each}
    </ul>
  </aside>
</section>

<style>
  .about {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 1.5rem 5rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 22rem;
    gap: 4rem;
    align-items: start;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 800;
    font-stretch: 75%;
    text-transform: uppercase;
    letter-spacing: 0.01em;
    margin-bottom: 1rem;
  }

  .text > p {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--ink-2);
    max-width: 68ch;
    text-wrap: pretty;
  }

  .text > p :global(b) {
    color: var(--ink);
    font-weight: 700;
  }

  .ai {
    margin-top: 1.75rem;
    max-width: 68ch;
    border-top: 1px solid var(--steel-2);
    border-bottom: 1px solid var(--steel-2);
  }

  .ai summary {
    cursor: pointer;
    list-style: none;
    padding: 0.875rem 0;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ai summary::-webkit-details-marker {
    display: none;
  }

  .ai summary::after {
    content: "";
    width: 0.5rem;
    height: 0.5rem;
    border-right: 2px solid var(--label);
    border-bottom: 2px solid var(--label);
    rotate: 45deg;
    translate: 0 -2px;
    transition: rotate 300ms var(--ease-out);
  }

  .ai[open] summary::after {
    rotate: 225deg;
    translate: 0 2px;
  }

  .ai summary:hover {
    color: var(--label);
  }

  .ai p {
    color: var(--ink-2);
    padding-bottom: 1.25rem;
    line-height: 1.7;
  }

  .tech {
    padding-top: 0.5rem;
  }

  h3 {
    font-size: 0.875rem;
    font-weight: 700;
    font-stretch: 80%;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-3);
    margin-bottom: 0.75rem;
  }

  .tech ul {
    list-style: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem 1rem;
  }

  .tech a {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.375rem 0;
    color: var(--ink-2);
    font-size: 0.9375rem;
  }

  .tech a:hover {
    opacity: 1;
    text-decoration: none;
    color: var(--ink);
  }

  .tech a :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    .about {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
  }

  @media (max-width: 640px) {
    .about {
      padding: 0 1rem 3.5rem;
    }

    .text > p {
      font-size: 1.0625rem;
    }
  }
</style>
