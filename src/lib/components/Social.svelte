<script lang="ts">
  import { socialLinks } from "#lib/index.js";
  import { m } from "#lib/paraglide/messages.js";
</script>

<section id="social" class="social" aria-labelledby="social-title">
  <div class="intro">
    <h2 id="social-title">{m["findMe.title"]()}</h2>
    <p>{m["findMe.description"]()}</p>
  </div>
  <ul class="links" role="list">
    {#each socialLinks as social (social.name)}
      <li>
        <a href={social.url} target="_blank" rel="noopener noreferrer">
          <social.icon />
          {social.name}
        </a>
      </li>
    {/each}
  </ul>
</section>

<style>
  .social {
    max-width: var(--max-width);
    margin: 0 auto 4rem;
    padding: 2rem 1.5rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1.5rem 3rem;
    align-items: center;
    border-top: 1px solid var(--steel-2);
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 800;
    font-stretch: 75%;
    text-transform: uppercase;
    letter-spacing: 0.01em;
  }

  p {
    color: var(--ink-2);
    max-width: 52ch;
    margin-top: 0.25rem;
  }

  .links {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .links a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: var(--steel-2);
    border: 1px solid var(--steel-edge);
    border-radius: 2px;
    color: var(--ink);
    font-weight: 600;
    transition:
      border-color 150ms var(--ease-out),
      color 150ms var(--ease-out);
  }

  .links a:hover {
    opacity: 1;
    text-decoration: none;
    border-color: var(--label);
    color: var(--label);
  }

  .links a :global(svg) {
    width: 1.125rem;
    height: 1.125rem;
  }

  @media (max-width: 900px) {
    .social {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .social {
      padding: 2rem 1rem;
      margin-bottom: 2rem;
    }
  }
</style>
