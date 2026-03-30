<script lang="ts">
  import { m } from "$lib/paraglide/messages";
</script>

<section class="section business-imprint" id="imprint">
  <div class="business-container">
    <div class="imprint-content">
      <h3>{m["business.imprint.title"]()}</h3>
      <p>
        LukeZ Development by Luca Hentschel<br />
        Schneeberger Str. 31<br />
        08112 Wilkau-Haßlau<br />
        Germany<br />
        <small>{m["business.imprint.noPackages"]()}</small>
      </p>

      <p>{@html m["business.imprint.vatLabel"]({ vatId: "DE457982866" })}</p>

      <h3>{m["business.imprint.contactTitle"]()}</h3>
      <p>
        {@html m["business.imprint.emailLabel"]({ email: "contact.lukez@proton.me" })}
      </p>
    </div>
  </div>
</section>

<style>
  .business-container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 2rem;
  }

  @media screen and (max-width: 768px) {
    .business-container {
      padding: 0 1rem;
    }
  }

  /* Imprint Section */
  .imprint-content {
    max-width: 700px;
    margin: 0 auto;
    color: var(--color-text-secondary);
  }

  .imprint-content h3 {
    font-size: 1.3rem;
    color: var(--color-text-primary);
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .imprint-content h3:first-child {
    margin-top: 0;
  }

  .imprint-content p {
    line-height: 1.8;
    margin-bottom: 1rem;
  }

  .imprint-content small {
    opacity: 0.75;
  }

  /* .imprint-content a {
    color: var(--color-accent);
    transition: color 200ms ease-in-out;
  }

  .imprint-content a:hover {
    color: var(--color-accent-hover);
  } */
  :global(.imprint-content a) {
    color: var(--color-accent);
    transition: color 200ms ease-in-out;
  }
  
  :global(.imprint-content a:hover) {
    color: var(--color-accent-hover);
  }
</style>
