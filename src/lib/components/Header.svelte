<script lang="ts">
  import { page } from "$app/state";
  import { m } from "#lib/paraglide/messages.js";
  import { getLocale, localizeHref, type Locale } from "#lib/paraglide/runtime.js";

  const languages: { id: Locale; label: string; name: string }[] = [
    { id: "en", label: "EN", name: "English" },
    { id: "de", label: "DE", name: "Deutsch" },
  ];

  // Re-read on every navigation so the active state always matches the URL.
  const current = $derived((page.url, getLocale()));
</script>

<header class="header no-select">
  <div class="header-container">
    <a href={localizeHref("/")} class="logo">LukeZ</a>

    <div class="lang" role="group" aria-label={m["header.language"]()}>
      {#each languages as lang (lang.id)}
        <a
          class="lang-btn mono"
          href={localizeHref(page.url.pathname, { locale: lang.id })}
          hreflang={lang.id}
          lang={lang.id}
          aria-current={current === lang.id ? "true" : undefined}
          aria-label={lang.name}
          data-sveltekit-reload
        >
          {lang.label}
        </a>
      {/each}
    </div>
  </div>
</header>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-height);
    background: var(--nav-overlay);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--steel-edge);
    z-index: 1000;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
  }

  .header-container {
    max-width: var(--max-width);
    margin: 0 auto;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 1.375rem;
    font-weight: 800;
    font-stretch: 75%;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--ink);
    text-decoration: none;
  }

  .logo:hover {
    opacity: 1;
    text-decoration: none;
    color: var(--label);
  }

  .lang {
    display: flex;
    border: 1px solid var(--steel-edge);
    border-radius: 3px;
    overflow: hidden;
  }

  .lang-btn {
    background: var(--steel-1);
    border: 0;
    color: var(--ink-3);
    font-size: 0.8125rem;
    line-height: 1.6;
    padding: 0.375rem 0.75rem;
    text-decoration: none;
    transition: color 150ms var(--ease-out);
  }

  .lang-btn + .lang-btn {
    border-left: 1px solid var(--steel-edge);
  }

  .lang-btn:hover {
    opacity: 1;
    text-decoration: none;
    color: var(--ink);
  }

  .lang-btn[aria-current="true"] {
    background: var(--label);
    color: var(--label-ink);
  }

  .lang-btn:focus-visible {
    outline-offset: -3px;
  }
</style>
