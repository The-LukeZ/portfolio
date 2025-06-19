<script lang="ts">
  import { getMessage, projects, socialLinks } from "$lib";
  import { m } from "$lib/paraglide/messages";
  import { setLocale, type Locale, getLocale } from "$lib/paraglide/runtime";
  import { scrollY } from "svelte/reactivity/window";
  import { Menu, XIcon, ExternalLink } from "$lib/assets/index.js";
  import { browser } from "$app/environment";
  import { fade } from "svelte/transition";

  let observedElements: HTMLElement[] = [];
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

    return () => {
      if (bgImage) {
        bgImage.style.opacity = "1"; // Reset opacity when component is destroyed
      }
    };
  });

  $effect(() => {
    if (browser) {
      // Yes, we have to declare the observer here because it's not available on the server (???)
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Add a class to the hero section when it is in view
              entry.target.classList.add("in-view");
            } else {
              // Remove the class when it is out of view
              entry.target.classList.remove("in-view");
            }
          });
        },
        { threshold: 0.1 } // Trigger when 10% of the element is visible
      );

      observedElements.push(
        ...(document.querySelectorAll(
          ".fade-in, .scale-up, .in-view"
        ) as NodeListOf<HTMLElement>)
      );
      observedElements.forEach((el) => {
        if (el) {
          observer.observe(el);
        }
      });

      return () => {
        observedElements.forEach((el) => {
          if (el) {
            observer.unobserve(el);
          }
        });
      };
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
    transition:fade={{ duration: 250 }}
  ></div>
{/if}

<!-- Mobile Menu -->
<div class="mobile-menu no-select" class:open={mobileMenuOpen}>
  <button class="close-btn" onclick={closeMobileMenu}>
    <XIcon />
  </button>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <ul class="mobile-nav-links" onclick={closeMobileMenu} onkeydown={() => {}}>
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
    <h2 class="section-title fade-in">{m["about.title"]()}</h2>
    <div class="about-content fade-in">
      <p>{m["about.description"]()}</p>
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="section projects">
    <h2 class="section-title fade-in">{m["projects.title"]()}</h2>
    <div class="projects-grid">
      {#each projects as project}
        {@const projectMsgKey = `project-${project.id}`}
        <div class="project-card fade-in scale-up">
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
    <h2 class="section-title fade-in">{m["findMe.title"]()}</h2>
    <p class="section-description fade-in">
      {m["findMe.description"]()}
    </p>
    <div class="social-links">
      {#each socialLinks as social}
        <a href={social.url} class="social-link scale-up" target="_blank">
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
