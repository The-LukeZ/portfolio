<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { getMessage, projects, socialLinks } from "$lib";
  import { ExternalLink, Menu, XIcon } from "$lib/assets/index.js";
  import { m } from "$lib/paraglide/messages";
  import { getLocale, localizeHref, setLocale, type Locale } from "$lib/paraglide/runtime";
  import { scrollY } from "svelte/reactivity/window";
  import { fade } from "svelte/transition";
  import { page } from "$app/state";

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
    if (bgImage && browser && screenDimensions.width && screenDimensions.height) {
      bgImage.style.backgroundImage = `url(https://picsum.photos/${screenDimensions.width}/${screenDimensions.height}.webp)`;
    }
  });

  $effect(() => {
    if (bgImage && heroSection && scrollY.current) {
      // Slowly decrease opacity based on scroll position

      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight - 70; // 60px for the height of the nav + 10px for some padding
      const opacity =
        BASE_BG_IMG_OPACITY -
        Math.min(BASE_BG_IMG_OPACITY, (scrollY.current / heroBottom) * BASE_BG_IMG_OPACITY);
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
        { threshold: 0.1 }, // Trigger when 10% of the element is visible
      );

      observedElements.push(
        ...(document.querySelectorAll(".fade-in, .scale-up, .in-view") as NodeListOf<HTMLElement>),
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
    <a href="#projects" onclick={closeMobileMenu}>{m["navigation.projects"]()}</a>
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

<div id="bg-image" bind:this={bgImage} style="opacity: {BASE_BG_IMG_OPACITY};"></div>

<!-- Navigation -->
<nav class="nav no-select">
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

<!-- Mobile Menu Overlay -->
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

<!-- Mobile Menu -->
<div class="mobile-menu no-select" class:open={mobileMenuOpen}>
  <button class="close-btn" onclick={closeMobileMenu} aria-label="Close mobile menu">
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
      <a href="#about" class="cta-button" onclick={() => scrollToSection("about")}>
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
          age: "21",
          country: m["about.country"](),
        })}
      </p>
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="section projects">
    <h2 class="section-title fade-in">{m["projects.title"]()}</h2>
    <div class="projects-accordion fade-in">
      {#each projects as project, index}
        {@const projectMsgKey = `project-${project.id}`}
        <details
          class="accordion-item"
          name="projects-accordion"
          id={projectMsgKey}
          ontoggle={(e) => {
            if (e.currentTarget.open) {
              goto(`#${projectMsgKey}`, { noScroll: true, keepFocus: true });
              return;
            }

            if (page.url.hash === `#${projectMsgKey}`) {
              const newUrl = new URL($state.snapshot(page.url.toString()));
              newUrl.hash = "";
              goto(newUrl, { noScroll: true, keepFocus: true });
            }
          }}
        >
          <summary class="accordion-header">
            <span class="accordion-number">{String(index + 1).padStart(2, "0")}</span>
            <span class="accordion-title">{getMessage(`${projectMsgKey}.title`)()}</span>
            <span class="accordion-icon"></span>
          </summary>
          <div class="accordion-content">
            <p>{getMessage(`${projectMsgKey}.description`)()}</p>
            <a href={project.link} class="project-link" target="_blank" rel="noopener noreferrer">
              {m["projects.cta"]()}
              <ExternalLink size={14} />
            </a>
          </div>
        </details>
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
  <p>&copy; 2025 LukeZ. All rights reserved.</p>
</footer>
