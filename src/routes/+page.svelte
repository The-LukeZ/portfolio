<script lang="ts">
  import { browser } from "$app/environment";
  import { defaultUnsplashImage, getMessage, projects, socialLinks } from "$lib";
  import {
    ExternalLink,
    Menu,
    MongoDB,
    Postgres,
    Supabase,
    Svelte,
    Swift,
    Symfony,
    Tailwind,
    Typescript,
    Vue,
    XIcon,
  } from "$lib/assets/index.js";
  import { m } from "$lib/paraglide/messages";
  import { getLocale, localizeHref, setLocale, type Locale } from "$lib/paraglide/runtime";
  import { scrollY } from "svelte/reactivity/window";
  import { fade } from "svelte/transition";

  const BASE_BG_IMG_OPACITY = 0.4;
  let observedElements: HTMLElement[] = [];
  let mobileMenuOpen = $state(false);
  let bgImage: HTMLDivElement | null = $state(null);
  let blurCanvas: HTMLCanvasElement | null = $state(null);
  let heroSection: HTMLElement | null = $state(null);
  let imageLoaded = $state(false);
  let imageData = $state<CookieUnsplashImage | null>(null);
  let usingFallback = $state(false);

  let screenDimensions = $state<{
    width: number | null;
    height: number | null;
  }>({
    width: null,
    height: null,
  });

  /**
   * Decodes a BlurHash string into pixel data for canvas rendering.
   *
   * BlurHash is a compact representation of an image placeholder - Unsplash provides these
   * so we can show a blurred preview instantly while the full image loads, improving perceived performance.
   *
   * The algorithm works by:
   * 1. Decoding the hash into DCT (Discrete Cosine Transform) color components
   * 2. Reconstructing the image by summing cosine basis functions weighted by these components
   * 3. Converting from linear color space back to sRGB for display
   *
   * @see https://blurha.sh for the algorithm specification
   *
   * Note: Made by AI
   */
  function decodeBlurHash(
    hash: string,
    width: number,
    height: number,
    punch: number = 1,
  ): Uint8ClampedArray | null {
    // Base83 alphabet used by BlurHash - allows compact encoding of color data
    const digitCharacters =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

    const decode83 = (str: string): number => {
      let value = 0;
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        const digit = digitCharacters.indexOf(c);
        value = value * 83 + digit;
      }
      return value;
    };

    // sRGB uses gamma correction for human perception - we need linear values for accurate color math
    const sRGBToLinear = (value: number): number => {
      const v = value / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    const linearToSRGB = (value: number): number => {
      const v = Math.max(0, Math.min(1, value));
      return v <= 0.0031308
        ? Math.round(v * 12.92 * 255 + 0.5)
        : Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
    };

    // Signed power preserves the sign - needed because AC components can be negative
    const signPow = (base: number, exp: number): number => Math.sign(base) * Math.pow(Math.abs(base), exp);

    // DC component is the average color of the image
    const decodeDC = (value: number): [number, number, number] => {
      const intR = value >> 16;
      const intG = (value >> 8) & 255;
      const intB = value & 255;
      return [sRGBToLinear(intR), sRGBToLinear(intG), sRGBToLinear(intB)];
    };

    // AC components represent the detail/variation from the average
    const decodeAC = (value: number, maxVal: number): [number, number, number] => {
      const quantR = Math.floor(value / (19 * 19));
      const quantG = Math.floor(value / 19) % 19;
      const quantB = value % 19;
      return [
        signPow((quantR - 9) / 9, 2.0) * maxVal,
        signPow((quantG - 9) / 9, 2.0) * maxVal,
        signPow((quantB - 9) / 9, 2.0) * maxVal,
      ];
    };

    if (!hash || hash.length < 6) return null;

    // First character encodes the grid size (how many frequency components)
    const sizeFlag = decode83(hash[0]);
    const numY = Math.floor(sizeFlag / 9) + 1;
    const numX = (sizeFlag % 9) + 1;

    // Second character encodes the maximum AC component value (for dequantization)
    const quantisedMaxVal = decode83(hash[1]);
    const maxVal = (quantisedMaxVal + 1) / 166;

    const colors: [number, number, number][] = new Array(numX * numY);
    colors[0] = decodeDC(decode83(hash.substring(2, 6)));

    for (let i = 1; i < numX * numY; i++) {
      colors[i] = decodeAC(decode83(hash.substring(4 + i * 2, 6 + i * 2)), maxVal * punch);
    }

    const pixels = new Uint8ClampedArray(width * height * 4);

    // Reconstruct image by summing cosine waves at each pixel position
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0;
        for (let j = 0; j < numY; j++) {
          for (let i = 0; i < numX; i++) {
            const basis = Math.cos((Math.PI * x * i) / width) * Math.cos((Math.PI * y * j) / height);
            const color = colors[i + j * numX];
            r += color[0] * basis;
            g += color[1] * basis;
            b += color[2] * basis;
          }
        }
        const idx = 4 * (x + y * width);
        pixels[idx] = linearToSRGB(r);
        pixels[idx + 1] = linearToSRGB(g);
        pixels[idx + 2] = linearToSRGB(b);
        pixels[idx + 3] = 255;
      }
    }
    return pixels;
  }

  function renderBlurHash(canvas: HTMLCanvasElement, hash: string, width: number, height: number) {
    const pixels = decodeBlurHash(hash, width, height);
    if (!pixels) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }

  const IMAGE_CACHE_KEY = "cached_background_images";
  const MAX_CACHED_IMAGES = 10;

  interface CachedImage {
    id: string;
    url: string;
    authorName: string;
    authorProfileUrl: string;
    htmlUrl: string;
    blurHash: string;
    timestamp: string;
  }

  /**
   * Gets all cached images from localStorage.
   */
  function getCachedImages(): CachedImage[] {
    try {
      const cached = localStorage.getItem(IMAGE_CACHE_KEY);
      if (!cached) return [];
      return JSON.parse(cached) as CachedImage[];
    } catch {
      return [];
    }
  }

  /**
   * Saves an image to the localStorage cache.
   * Maintains a maximum of MAX_CACHED_IMAGES, removing oldest entries when full.
   */
  function cacheImage(image: CachedImage) {
    try {
      const cached = getCachedImages();
      // Check if image already exists (by ID)
      if (cached.some((img) => img.id === image.id)) return;

      cached.push(image);
      // Remove oldest images if we exceed the max
      while (cached.length > MAX_CACHED_IMAGES) {
        cached.shift();
      }
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cached));
    } catch (e) {
      console.warn("Failed to cache image:", e);
    }
  }

  /**
   * Gets a random cached image from localStorage.
   */
  function getRandomCachedImage(): CachedImage | null {
    const cached = getCachedImages();
    if (cached.length === 0) return null;
    return cached[Math.floor(Math.random() * cached.length)];
  }

  /**
   * Uses the local fallback image when API fails or is unavailable.
   * This ensures users always see a background even when the api fails.
   */
  function useFallbackImage() {
    // Directly load the fallback - no blur hash available for local images
    const img = new Image();
    img.onload = () => {
      imageLoaded = true;
      if (bgImage) {
        bgImage.style.backgroundImage = `url(${defaultUnsplashImage.url})`;
      }
    };
    img.src = defaultUnsplashImage.url;
    usingFallback = true;
  }

  /**
   * Uses a cached image from localStorage.
   */
  function useCachedImage(cached: CachedImage) {
    imageData = {
      url: cached.url,
      authorName: cached.authorName,
      authorProfileUrl: cached.authorProfileUrl,
      htmlUrl: cached.htmlUrl,
    };

    // Render blur hash if available
    if (blurCanvas && cached.blurHash) {
      renderBlurHash(blurCanvas, cached.blurHash, 32, 32);
    }

    const img = new Image();
    img.onload = () => {
      imageLoaded = true;
      if (bgImage) {
        bgImage.style.backgroundImage = `url(${cached.url})`;
      }
    };
    img.onerror = () => {
      // Cached image URL might be expired - fall back gracefully
      console.warn("Failed to load cached image, using fallback");
      useFallbackImage();
    };
    img.src = cached.url;
  }

  async function fetchBackgroundImage(width: number, height: number) {
    try {
      const res = await fetch(`/get-image?dim=${width}x${height}`, {
        credentials: "same-origin",
      });

      if (!res.ok) {
        // Rate limited or other error - try to use cached image
        if (res.status === 429) {
          console.warn("Rate limited, using cached image");
          const cached = getRandomCachedImage();
          if (cached) {
            useCachedImage(cached);
            return;
          }
        }
        console.warn("Image API returned error, using fallback");
        useFallbackImage();
        return;
      }

      const data: GetImageRes = await res.json();

      if (data.type === "success" && blurCanvas) {
        imageData = {
          url: data.image.urls.full,
          authorName: data.image.user.name,
          authorProfileUrl: `https://unsplash.com/@${data.image.user.username}?utm_source=lukez-portfolio&utm_medium=referral`,
          htmlUrl: `${data.image.links.html}?utm_source=lukez-portfolio&utm_medium=referral`,
        };

        // Cache the image for future use
        cacheImage({
          id: data.image.id,
          url: data.image.urls.full,
          authorName: data.image.user.name,
          authorProfileUrl: `https://unsplash.com/@${data.image.user.username}?utm_source=lukez-portfolio&utm_medium=referral`,
          htmlUrl: `${data.image.links.html}?utm_source=lukez-portfolio&utm_medium=referral`,
          blurHash: data.image.blur_hash,
          timestamp: new Date().toISOString(),
        });

        // Render at small size (32x32) since it will be scaled up with CSS blur anyway
        // This keeps the decode fast while still providing color information
        renderBlurHash(blurCanvas, data.image.blur_hash, 32, 32);

        // Preload in background so we can fade in smoothly once ready
        const img = new Image();
        img.onload = () => {
          imageLoaded = true;
          if (bgImage) {
            bgImage.style.backgroundImage = `url(${data.image.urls.full})`;
          }
        };
        img.onerror = () => {
          // Image URL from API might be invalid/expired - fall back gracefully
          console.warn("Failed to load Unsplash image, using fallback");
          useFallbackImage();
        };
        img.src = data.image.urls.full;
      } else if (data.type === "error") {
        console.warn("Image API returned error response, using fallback");
        // Try cached image first, then fallback
        const cached = getRandomCachedImage();
        if (cached) {
          useCachedImage(cached);
        } else {
          useFallbackImage();
        }
      }
    } catch (e) {
      // Network errors, timeouts, etc. - try cached image first
      console.error("Failed to fetch background image:", e);
      const cached = getRandomCachedImage();
      if (cached) {
        useCachedImage(cached);
      } else {
        useFallbackImage();
      }
    }
  }

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
    // Fetch background image when screen dimensions are available
    if (browser && screenDimensions.width && screenDimensions.height && !imageData) {
      fetchBackgroundImage(screenDimensions.width, screenDimensions.height);
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

<div id="bg-blur" class:loaded={imageLoaded}>
  <canvas bind:this={blurCanvas}></canvas>
</div>
<div
  id="bg-image"
  bind:this={bgImage}
  class:loaded={imageLoaded}
  style="opacity: {BASE_BG_IMG_OPACITY};"
></div>

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
        {@html m["about.description"]({
          age: "21",
        })}
      </p>
      <h3>{m["about.aboutAiTitle"]()}</h3>
      <p>{m["about.aboutAi"]()}</p>
    </div>

    <h3 class="tech-stack-title">{m["about.techstackTitle"]()}</h3>
    <div class="tech-stack">
      <Supabase />
      <Svelte />
      <Tailwind />
      <Typescript />
      <Symfony />
      <Vue />
      <Swift />
      <MongoDB />
      <Postgres />
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="section projects">
    <h2 class="section-title fade-in">{m["projects.title"]()}</h2>
    <details open class="projects-section-accordion fade-in">
      <summary class="section-accordion-header">
        <span class="section-accordion-title">{m["projects.title"]()}</span>
        <span class="section-accordion-icon"></span>
      </summary>
      <div class="projects-grid">
        {#each projects as project, index}
          {@const projectMsgKey = `project-${project.id}`}
          <div class="project-card" id={projectMsgKey}>
            <div class="project-header">
              <span class="project-number">{String(index + 1).padStart(2, "0")}</span>
              <h3 class="project-title">{getMessage(`${projectMsgKey}.title`)()}</h3>
            </div>
            <div class="project-content">
              <p class="project-description">{getMessage(`${projectMsgKey}.description`)()}</p>
              <a href={project.link} class="project-link" target="_blank" rel="noopener noreferrer">
                {m["projects.cta"]()}
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        {/each}
      </div>
    </details>
  </section>

  <!-- Social Links Section -->
  <section id="social" class="section social">
    <h2 class="section-title fade-in">{m["findMe.title"]()}</h2>
    <p class="section-description fade-in">
      {m["findMe.description"]()}
    </p>
    <div class="social-links">
      {#each socialLinks as social}
        {#if social.url.startsWith("mailto")}
          <a href={social.url} class="social-link scale-up">
            <social.icon />
            {social.name}
          </a>
        {:else}
          <a href={social.url} class="social-link scale-up" target="_blank">
            <social.icon />
            {social.name}
          </a>
        {/if}
      {/each}
    </div>
  </section>
</main>

<!-- Footer -->
<footer class="footer">
  <p>&copy; 2025 LukeZ. All rights reserved.</p>

  <!-- Unsplash requires attribution per their API guidelines -->
  {#if imageData}
    <p class="image-attribution">
      Photo by
      <a href={imageData.authorProfileUrl} target="_blank">
        {imageData.authorName}
      </a>
      on
      <a href={imageData.htmlUrl} target="_blank">Unsplash</a>
    </p>
  {:else if usingFallback}
    <p class="image-attribution">
      Photo by
      <a href={defaultUnsplashImage.author.url} target="_blank">
        {defaultUnsplashImage.author.name}
      </a>
      on
      <a href={defaultUnsplashImage.htmlUrl} target="_blank">Unsplash</a>
    </p>
  {/if}
</footer>
