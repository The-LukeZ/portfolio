<script lang="ts">
  import { m } from "#lib/paraglide/messages.js";
  import { localizeHref } from "#lib/paraglide/runtime.js";

  const links = [
    { href: "/discord-permissions", label: m["footerNav.permissions"] },
    { href: "/textedit", label: m["footerNav.textedit"] },
    { href: "/business", label: m["footerNav.legal"] },
  ];
</script>

<footer class="footer">
  <div class="inner">
    <p>{@html m.footer({ year: String(new Date().getFullYear()) })}</p>
    <nav aria-label={m["footerNav.label"]()}>
      <ul role="list">
        {#each links as link (link.href)}
          <li><a href={localizeHref(link.href)} data-sveltekit-reload>{link.label()}</a></li>
        {/each}
      </ul>
    </nav>
  </div>
</footer>

<style>
  .footer {
    background-color: var(--steel-0);
    padding: 1.5rem 0;
    border-top: 1px solid var(--steel-2);
    color: var(--ink-3);
    font-size: 0.875rem;
  }

  .inner {
    max-width: var(--max-width);
    margin: 0 auto;
    padding-inline: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem 2rem;
  }

  ul {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1.5rem;
  }

  a {
    color: var(--ink-2);
    text-decoration: none;
    transition: color 150ms var(--ease-out);
  }

  a:hover {
    opacity: 1;
    color: var(--label);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  @media (max-width: 640px) {
    .inner {
      padding-inline: 1rem;
    }

    .inner {
      flex-direction: column-reverse;
      align-items: flex-start;
    }

    ul {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
