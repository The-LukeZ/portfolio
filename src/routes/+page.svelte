<script lang="ts">
  import { getMessage } from "$lib";
  import {
    Menu,
    XIcon,
    ExternalLink,
    Github,
    YouTube,
    Discord,
    Music,
    FileText,
  } from "$lib/assets/index.js";
  import { m } from "$lib/paraglide/messages";
  import { setLocale, type Locale, getLocale } from "$lib/paraglide/runtime";

  let mobileMenuOpen = $state(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  $inspect(getLocale());

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    closeMobileMenu();
  }

  const projects = [
    {
      id: "supportmail",
      link: "https://supportmail.dev",
    },
    {
      id: "burningdezibelz",
      link: "https://github.com/The-LukeZ/burning-dezibelz-v2",
    },
    {
      id: "portfolio",
      link: "https://github.com/The-LukeZ/portfolio",
    },
    {
      id: "lukez-monitor",
      link: "https://github.com/The-LukeZ/lukez-monitor",
    },
    {
      id: "djs-command-helper",
      link: "https://github.com/supportmailapp/djsCommandHelper",
    },
    {
      id: "timestring-py",
      link: "https://github.com/The-LukeZ/TimestringPy",
    },
  ];

  const socialLinks = [
    { name: "GitHub", icon: Github, url: "https://github.com/The-LukeZ" },
    {
      name: "YouTube",
      icon: YouTube,
      url: "https://youtube.com/@The_LukeZ",
    },
    { name: "Dev.to", icon: FileText, url: "https://dev.to/thelukez" },
    {
      name: "Discord",
      icon: Discord,
      url: "https://discord.com/users/506893652266844162",
    },
    { name: "Spotify", icon: Music, url: "https://stats.fm/lukez" },
  ];
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
<div id="bg-image"></div>

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
  <section id="home" class="hero">
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
        <a
          href={social.url}
          class="social-link"
          target="_blank"
          rel="noopener noreferrer"
        >
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
