<script lang="ts">
  import { KOFI_URL } from "#lib/index.js";
  import { KoFi } from "#lib/assets/index.js";
  import { m } from "#lib/paraglide/messages.js";
</script>

<aside class="kofi" aria-labelledby="kofi-title">
  <h2 id="kofi-title">{m["feed.kofi.title"]()}</h2>
  <a class="kofi-btn" href={KOFI_URL} target="_blank" rel="noopener">
    <KoFi />
    {m["feed.kofi.cta"]()}
  </a>
</aside>

<style>
  .kofi {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem 1.5rem;
    padding: 1.25rem 1.25rem 1.125rem;
    background: var(--steel-1);
    border: 1px solid var(--steel-edge);
    border-radius: 3px;
    box-shadow: inset 0 8px 12px -8px oklch(0% 0 0 / 0.7);
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 800;
    font-stretch: 75%;
    text-transform: uppercase;
    letter-spacing: 0.01em;
  }

  .kofi-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.85rem;
    background: var(--label);
    color: var(--label-ink);
    border-radius: 2px;
    font-weight: 700;
    text-decoration: none;
    transition: background-color 150ms var(--ease-out);
  }

  .kofi-btn:hover {
    opacity: 1;
    text-decoration: none;
    background: var(--color-accent-hover);
  }

  .kofi-btn :global(svg) {
    width: 1.125rem;
    height: 1.125rem;
  }
</style>
