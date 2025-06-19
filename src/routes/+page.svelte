<script lang="ts">
  import { getMessage, projects, socialLinks } from "$lib";
  import { m } from "$lib/paraglide/messages";
  import { setLocale, type Locale, getLocale } from "$lib/paraglide/runtime";
  import { scrollY } from "svelte/reactivity/window";
  import { Menu, XIcon, ExternalLink } from "$lib/assets/index.js";

  let mobileMenuOpen = $state(false);
  let bgImage: HTMLDivElement | null = null;
  let heroSection: HTMLElement | null = null;

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  $effect(() => {
    console.log("Locale:", getLocale());
  });

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    closeMobileMenu();
  }

  $effect(() => {
    if (bgImage && heroSection && scrollY.current) {
      // Slowly decrease opacity based on scroll position

      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight - 70; // 60px for the height of the nav + 10px for some padding
      if (scrollY.current < heroBottom) {
        const opacity = 1 - Math.min(1, scrollY.current / heroBottom);
        bgImage.style.opacity = opacity.toString();
      } else {
        bgImage.style.opacity = "0";
      }
    }
  });
</script>

<svelte:head>
  <title>LukeZ - Portfolio</title>
  <meta
    name="description"
    content="Full-stack developer passionate about creating innovative web solutions"
  />
</svelte:head>

{#snippet navItems()}
  <li><a href="#about">{m["navigation.about"]()}</a></li>
  <li><a href="#projects">{m["navigation.projects"]()}</a></li>
  <li><a href="#social">{m["navigation.contact"]()}</a></li>
  <!-- Language Switcher -->
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

<!-- TODO: Fix this -->
<div id="bg-image" bind:this={bgImage}></div>

<!-- Navigation -->
<nav class="nav no-select">
  <div class="nav-container">
    <a href="/" class="logo">LukeZ</a>

    <ul class="nav-links">
      {@render navItems()}
    </ul>

    <button class="mobile-menu-btn" onclick={toggleMobileMenu}>
      <Menu />
    </button>
  </div>
</nav>

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
  <div
    class="mobile-overlay open no-select"
    role="button"
    tabindex="0"
    onclick={closeMobileMenu}
    onkeydown={() => {}}
  ></div>
{/if}

<!-- Mobile Menu -->
<div class="mobile-menu no-select" class:open={mobileMenuOpen}>
  <button class="close-btn" onclick={closeMobileMenu}>
    <XIcon />
  </button>

  <ul class="mobile-nav-links">
    {@render navItems()}
  </ul>
</div>

<main>
  <!-- Hero Section -->
  <section id="home" class="hero" bind:this={heroSection}>
    <div class="hero-content">
      <h1>LukeZ</h1>
      <p class="subtitle">{m["hero.subtitle"]()}</p>
      <a
        href="#about"
        class="cta-button"
        onclick={() => scrollToSection("about")}
      >
        {m["hero.cta"]()}
      </a>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="section about">
    <h2 class="section-title">{m["about.title"]()}</h2>
    <div class="about-content">
      <p>{m["about.description"]()}</p>
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="section projects">
    <h2 class="section-title">{m["projects.title"]()}</h2>
    <div class="projects-grid">
      {#each projects as project}
        {@const projectMsgKey = `project-${project.id}`}
        <div class="project-card">
          <h3>{getMessage(`${projectMsgKey}.title`)()}</h3>
          <p>{getMessage(`${projectMsgKey}.description`)()}</p>
          <a
            href={project.link}
            class="project-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {m["projects.cta"]()}
            <ExternalLink size={14} />
          </a>
        </div>
      {/each}
    </div>
  </section>

  <!-- Social Links Section -->
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
</main>

<!-- Footer -->
<footer class="footer">
  <p>&copy; 2024 LukeZ. All rights reserved.</p>
</footer>
