<script lang="ts">
  import { socialLinks } from "$lib/index.js";
  import { m } from "$lib/paraglide/messages";
</script>

<section id="social" class="section social">
  <h2 class="section-title">{m["findMe.title"]()}</h2>
  <p class="section-description">
    {m["findMe.description"]()}
  </p>
  <div class="social-links">
    {#each socialLinks as social}
      <a href={social.url} class="social-link" target="_blank">
        <social.icon />
        {social.name}
      </a>
    {/each}
  </div>
</section>

<style>
  .social-links {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .social-link {
    display: inline-flex;
    align-items: center;
    border: none;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 200ms ease-in-out;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: var(--color-primary-bg);
    border: 1px solid var(--color-border);
    border-radius: 50px;
    color: var(--color-text-primary);
  }

  .social-link:hover {
    transform: translateY(-2px);
    border-color: var(--color-accent);
    background: var(--color-accent-background);
  }

  .social-link :global(svg) {
    width: 20px;
    height: 20px;
  }
</style>
