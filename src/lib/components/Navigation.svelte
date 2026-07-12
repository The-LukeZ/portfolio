<script lang="ts">
  import { Menu, XIcon } from "$lib/assets/index.js";
  import { m } from "$lib/paraglide/messages";
  import { getLocale, localizeHref, setLocale, type Locale } from "$lib/paraglide/runtime";
  import { scrollY } from "svelte/reactivity/window";
  import { fade } from "svelte/transition";

  let mobileMenuOpen = $state(false);

  let isScrolled = $derived((scrollY.current ?? 0) > 20);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

{#snippet navItems()}
  <li>
    <a href={localizeHref("/#about")} onclick={closeMobileMenu}>{m["navigation.about"]()}</a>
  </li>
  <li>
    <a href={localizeHref("/#projects")} onclick={closeMobileMenu}>{m["navigation.projects"]()}</a>
  </li>
  <li>
    <a href={localizeHref("/#social")} onclick={closeMobileMenu}>{m["navigation.contact"]()}</a>
  </li>
  <li>
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
  </li>
{/snippet}

<nav class="nav no-select" class:scrolled={isScrolled}>
  <div class="nav-container">
    <a href={localizeHref("/")} class="logo font-inter">LukeZ</a>

    <button class="mobile-menu-btn" onclick={toggleMobileMenu} aria-label="Toggle mobile menu">
      <Menu />
    </button>

    <ul class="nav-links">
      {@render navItems()}
    </ul>
  </div>
</nav>

{#if mobileMenuOpen}
  <div
    aria-label="Close mobile menu"
    class="mobile-overlay open no-select"
    role="button"
    tabindex="0"
    onclick={closeMobileMenu}
    onkeydown={() => {}}
    transition:fade={{ duration: 250 }}
  ></div>
{/if}

<div class="mobile-menu no-select" class:open={mobileMenuOpen}>
  <button class="close-btn" onclick={closeMobileMenu} aria-label="Close mobile menu">
    <XIcon />
  </button>

  <ul class="mobile-nav-links">
    {@render navItems()}
  </ul>
</div>

<style>
  .nav {
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

  .nav-container {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: max-width 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav.scrolled .nav-container {
    max-width: var(--max-width);
  }

  .mobile-menu-btn {
    display: none;
    align-items: center;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 200ms ease-in-out;
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text-primary);
    font-size: 1.5rem;
    margin-left: auto;
    padding: 0.5rem;
  }

  @media screen and (max-width: 768px) {
    .mobile-menu-btn {
      display: flex;
    }
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

  .nav-links {
    display: flex;
    align-items: center;
    list-style: none;
    gap: 2rem;
    transition:
      transform 200ms ease-in-out,
      opacity 200ms ease-in-out;
  }

  @media screen and (max-width: 768px) {
    .nav-links {
      transform: translateX(200%);
      opacity: 0;
      pointer-events: none;
      position: absolute;
    }
  }

  .nav-links a {
    color: var(--color-text-secondary);
    text-decoration: none;
    font-weight: 600;
    font-size: 1.075rem;
    transition: color 200ms ease-in-out;
  }

  .nav-links a:hover {
    color: var(--color-accent);
  }

  .mobile-menu {
    position: fixed;
    top: 0;
    right: -100%;
    width: 300px;
    height: 100vh;
    background: var(--color-secondary-bg);
    transition: right 250ms ease-in-out;
    z-index: 1001;
    padding: 2rem;
  }

  .mobile-menu.open {
    right: 0;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem;
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-size: 1.5rem;
    cursor: pointer;
  }

  .mobile-nav-links {
    list-style: none;
    margin-top: 3rem;
  }

  .mobile-nav-links li {
    margin-bottom: 1.5rem;
  }

  .mobile-nav-links a {
    display: block;
    width: 100%;
    color: var(--color-text-primary);
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: 500;
    transition: color 200ms ease-in-out;
  }

  .mobile-nav-links a:hover {
    color: var(--color-accent);
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: var(--mobile-overlay);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 200ms ease-in-out,
      visibility 200ms ease-in-out;
  }

  .mobile-overlay.open {
    opacity: 1;
    visibility: visible;
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
    width: 100%;
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
