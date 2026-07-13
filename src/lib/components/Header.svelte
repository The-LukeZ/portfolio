<script lang="ts">
  import { getLocale, localizeHref, setLocale, type Locale } from "$lib/paraglide/runtime";
</script>

<header class="header no-select">
  <div class="header-container">
    <a href={localizeHref("/")} class="logo font-inter">LukeZ</a>

    <select
      id="language-select"
      aria-label="Select Language"
      class="language-select"
      onchange={(e) => {
        const lang = e.currentTarget.value;
        setLocale(lang as Locale, { reload: true });
      }}
    >
      <option value="en" selected={getLocale() === "en"}>English</option>
      <option value="de" selected={getLocale() === "de"}>Deutsch</option>
    </select>
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
    border-bottom: 1px solid var(--color-border);
    z-index: 1000;
    padding: 0.5rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
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
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-accent);
    text-decoration: none;
    transition: color 150ms ease-in-out;
  }

  .logo:hover {
    color: var(--color-accent-hover);
  }

  .language-select {
    display: inline-flex;
    align-items: center;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    appearance: none;
    background: var(--color-secondary-bg);
    border: 1px solid var(--color-border);
    padding: 0.5rem 1rem;
    color: var(--color-text-primary);
    font-size: 1rem;
    transition: all 200ms ease-in-out;
  }

  .language-select:hover {
    border-color: var(--color-accent);
    background: var(--color-accent-background);
  }

  .language-select option {
    background: var(--color-secondary-bg);
    color: var(--color-text-primary);
    width: fit-content;
  }
</style>
