<script lang="ts">
  import { m } from "$lib/paraglide/messages";
</script>

<section class="section business-notice" id="notice">
  <div class="business-container">
    <div class="notice-content">
      <p>
        LukeZ Development by Luca Hentschel<br />
        Schneeberger Str. 31<br />
        08112 Wilkau-Haßlau<br />
        Germany<br />
        <small>{m["business.legalNotice.noPackages"]()}</small>
      </p>

      <p>{@html m["business.legalNotice.vatLabel"]({ vatId: "DE457982866" })}</p>

      <h3>{m["business.legalNotice.contactTitle"]()}</h3>
      <p>
        {@html m["business.legalNotice.emailLabel"]({ email: "contact.lukez@proton.me" })}
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

  /* Legal Notice Section */
  .notice-content {
    max-width: 700px;
    margin: 0 auto;
    color: var(--color-text-secondary);
  }

  .notice-content h3 {
    font-size: 1.3rem;
    color: var(--color-text-primary);
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .notice-content h3:first-child {
    margin-top: 0;
  }

  .notice-content p {
    line-height: 1.8;
    margin-bottom: 1rem;
  }

  .notice-content small {
    opacity: 0.75;
  }

  :global(.notice-content a) {
    color: var(--color-accent);
    transition: color 200ms ease-in-out;
  }

  :global(.notice-content a:hover) {
    color: var(--color-accent-hover);
  }
</style>
