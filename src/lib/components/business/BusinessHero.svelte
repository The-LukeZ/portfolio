<script lang="ts">
  import { m } from "#lib/paraglide/messages.js";
  import { localizeHref } from "#lib/paraglide/runtime.js";
</script>

<section class="business-about" id="about">
  <h1 class="selectable">LukeZ Development <span>by Luca Hentschel</span></h1>
  <p class="subtitle">{m["business.subtitle"]()}</p>

  <div class="info selectable">
    <p>{@html m["business.description"]()}</p>
    <p>{@html m["business.projectsText"]({ projectsLink: localizeHref("/#projects") })}</p>
  </div>
</section>

<style>
  .business-about {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 4rem 1.5rem 3rem;
  }

  h1 {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    font-stretch: 72%;
    text-transform: uppercase;
    line-height: 0.95;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }

  h1 span {
    display: block;
    color: var(--ink-3);
  }

  .subtitle {
    margin-top: 1rem;
    display: inline-block;
    background: var(--label);
    color: var(--label-ink);
    font-weight: 700;
    font-stretch: 78%;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 0.3rem 0.6rem;
    border-radius: 1px;
  }

  .info {
    margin-top: 2rem;
    max-width: 68ch;
  }

  .info p {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--ink-2);
    text-wrap: pretty;
  }

  .info p + p {
    margin-top: 1rem;
  }

  .info :global(b) {
    color: var(--ink);
  }

  /* "not for hire": set on the orange label tape so nobody misses it */
  .info :global(mark) {
    background: var(--label);
    color: var(--label-ink);
    font-weight: 700;
    padding: 0.05em 0.35em;
    border-radius: 1px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .info :global(a) {
    color: var(--label);
    text-decoration: underline;
    text-decoration-color: oklch(75% 0.179 58 / 0.4);
    text-underline-offset: 0.2em;
  }

  .info :global(a:hover) {
    opacity: 1;
    text-decoration-color: currentColor;
  }

  @media (max-width: 640px) {
    .business-about {
      padding: 2.5rem 1rem 2rem;
    }

    .info p {
      font-size: 1.0625rem;
    }
  }
</style>
