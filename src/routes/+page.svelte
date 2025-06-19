<script lang="ts">
  import { calculateAge, getMessage, projects, socialLinks } from "$lib";
  import { m } from "$lib/paraglide/messages";
  import { setLocale, type Locale, getLocale } from "$lib/paraglide/runtime";
  import { scrollY } from "svelte/reactivity/window";
  import { Menu, XIcon, ExternalLink } from "$lib/assets/index.js";
  import { browser } from "$app/environment";
  import { fade } from "svelte/transition";
  import { PUBLIC_DATE_OF_BIRTH } from "$env/static/public";

  const BASE_BG_IMG_OPACITY = 0.4;
  let observedElements: HTMLElement[] = [];
  let mobileMenuOpen = $state(false);
  let bgImage: HTMLDivElement | null = $state(null);
  let heroSection: HTMLElement | null = $state(null);
  let screenDimensions = $state<{
    width: number | null;
    height: number | null;
  }>({
    width: null,
    height: null,
  });

  $inspect(screenDimensions);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    closeMobileMenu();
  }

  $effect(() => {
    // Set the background image URL based on screen dimensions (We don't want this on resize, only on initial load)
    if (
      bgImage &&
      browser &&
      screenDimensions.width &&
      screenDimensions.height
    ) {
      bgImage.style.backgroundImage = `url(https://picsum.photos/${screenDimensions.width}/${screenDimensions.height}.webp)`;
    }
  });

  $effect(() => {
    if (bgImage && heroSection && scrollY.current) {
      // Slowly decrease opacity based on scroll position

      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight - 70; // 60px for the height of the nav + 10px for some padding
      const opacity =
        BASE_BG_IMG_OPACITY -
        Math.min(
          BASE_BG_IMG_OPACITY,
          (scrollY.current / heroBottom) * BASE_BG_IMG_OPACITY
        );
      bgImage.style.opacity = opacity.toString();
    }

    return () => {
      if (bgImage) {
        bgImage.style.opacity = BASE_BG_IMG_OPACITY.toString(); // Reset opacity when component is destroyed
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

<svelte:window
  {@attach (w) => {
    screenDimensions = {
      width: w.innerWidth,
      height: w.innerHeight,
    };
  }}
/>

{#snippet navItems()}
  <li>
    <a href="#about" onclick={closeMobileMenu}>{m["navigation.about"]()}</a>
  </li>
  <li>
    <a href="#projects" onclick={closeMobileMenu}
      >{m["navigation.projects"]()}</a
    >
  </li>
  <li>
    <a href="#social" onclick={closeMobileMenu}>{m["navigation.contact"]()}</a>
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

<div
  id="bg-image"
  bind:this={bgImage}
  style="opacity: {BASE_BG_IMG_OPACITY};"
></div>

<!-- Navigation -->
<nav class="nav no-select">
  <div class="nav-container">
    <a href="/" class="logo font-inter">LukeZ</a>

    <button
      class="mobile-menu-btn"
      onclick={toggleMobileMenu}
      aria-label="Toggle mobile menu"
    >
      <Menu />
    </button>

    <ul class="nav-links">
      {@render navItems()}
    </ul>
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
    <h2 class="section-title fade-in">{m["about.title"]()}</h2>
    <div class="about-content fade-in">
      <p>
        {m["about.description"]({
          age: calculateAge(new Date(PUBLIC_DATE_OF_BIRTH)),
          country: m["about.country"](),
        })}
      </p>
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
