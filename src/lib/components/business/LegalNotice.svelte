<script lang="ts">
  import { m } from "#lib/paraglide/messages.js";
</script>

<section class="business-notice" id="notice" aria-labelledby="notice-title">
  <h2 class="plate" id="notice-title">{m["business.legalNotice.title"]()}</h2>

  <div class="panel">
    <div class="cell selectable">
      <h3>{m["business.legalNotice.addressTitle"]()}</h3>
      <address>
        LukeZ Development by Luca Hentschel<br />
        Schneeberger Str. 31<br />
        08112 Wilkau-Haßlau<br />
        Germany
      </address>
      <p class="note">{m["business.legalNotice.noPackages"]()}</p>
    </div>

    <div class="cell selectable">
      <p class="labelled">{@html m["business.legalNotice.vatLabel"]({ vatId: "DE457982866" })}</p>
    </div>

    <div class="cell selectable">
      <p class="labelled">
        {@html m["business.legalNotice.emailLabel"]({ email: "hello@thelukez.com" })}
      </p>
    </div>
  </div>
</section>

<style>
  .business-notice {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 1rem 1.5rem 5rem;
  }

  .plate {
    display: inline-block;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    font-weight: 700;
    font-stretch: 80%;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-2);
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--steel-2);
    border-radius: 2px;
    background: var(--steel-1);
  }

  .panel {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--steel-0);
    border: 1px solid var(--steel-edge);
    border-radius: 6px;
    box-shadow: inset 0 1px 0 var(--steel-3);
  }

  .cell {
    background: linear-gradient(to bottom, var(--steel-3), var(--steel-2));
    border: 1px solid var(--steel-edge);
    border-radius: 3px;
    box-shadow:
      inset 0 1px 0 var(--steel-hi),
      inset 0 -5px 0 var(--steel-1);
    padding: 1.125rem 1.25rem 1.5rem;
    color: var(--ink);
  }

  /* Field labels: the h3 and the <b> inside the localized label messages share one style. */
  h3,
  .labelled :global(b) {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 700;
    font-stretch: 80%;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-3);
  }

  address {
    font-style: normal;
    line-height: 1.6;
  }

  .note {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: var(--ink-3);
  }

  .labelled :global(span) {
    font-family: var(--font-mono) !important;
    font-size: 1.0625rem;
  }

  .labelled :global(a) {
    color: var(--label);
    text-decoration: underline;
    text-decoration-color: oklch(75% 0.179 58 / 0.4);
    text-underline-offset: 0.2em;
    overflow-wrap: anywhere;
  }

  .labelled :global(a:hover) {
    opacity: 1;
    text-decoration-color: currentColor;
  }

  @media (max-width: 900px) {
    .panel {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .business-notice {
      padding: 0.5rem 1rem 3.5rem;
    }

    .panel {
      padding: 0.5rem;
    }
  }
</style>
