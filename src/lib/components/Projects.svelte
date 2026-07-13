<script lang="ts">
  import { tick } from "svelte";
  import { getMessage } from "$lib/index.js";
  import { projectsByLocale, tags } from "$lib/projects/index.js";
  import { getLocale } from "$lib/paraglide/runtime";
  import { ExternalLink } from "$lib/assets/index.js";
  import { m } from "$lib/paraglide/messages";

  const ALL = "all";

  let selectedTag = $state<string>(ALL);

  const localeProjects = $derived(projectsByLocale[getLocale()] ?? projectsByLocale.en);

  const filteredProjects = $derived(
    selectedTag === ALL ? localeProjects : localeProjects.filter((p) => p.tags.includes(selectedTag)),
  );

  let tabsEl: HTMLElement | undefined = $state();
  let leftFadePx = $state(0);
  let rightFadePx = $state(0);

  const FADE_WIDTH = 48;

  function updateFade() {
    if (!tabsEl) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsEl;
    leftFadePx = Math.min(scrollLeft, FADE_WIDTH);
    const remaining = scrollWidth - clientWidth - scrollLeft;
    rightFadePx = Math.min(Math.max(remaining, 0), FADE_WIDTH);
  }

  const tabsMask = $derived(
    `linear-gradient(to right, transparent, black ${leftFadePx}px, black calc(100% - ${rightFadePx}px), transparent)`,
  );

  $effect(() => {
    // re-check fade whenever the tab list itself changes size (e.g. locale switch)
    tags.length;
    tick().then(updateFade);
  });

  $effect(() => {
    if (!tabsEl) return;
    window.addEventListener("resize", updateFade);
    return () => window.removeEventListener("resize", updateFade);
  });

  function selectTag(tagId: string) {
    selectedTag = tagId;
  }
</script>

<section id="projects" class="section projects">
  <h2 class="section-title fade-in">{m["projects.title"]()}</h2>
  <p class="section-subtitle fade-in delay-200">{m["projects.subtitle"]()}</p>
  <div class="projects-container fade-in">
    <div class="tabs-wrapper">
      <div
        class="tabs-scroll"
        bind:this={tabsEl}
        onscroll={updateFade}
        style:mask-image={tabsMask}
        style:-webkit-mask-image={tabsMask}
      >
        <button type="button" class="tab" class:active={selectedTag === ALL} onclick={() => selectTag(ALL)}>
          {getMessage(`projects.tag.${ALL}`)()}
        </button>
        {#each tags as tagId (tagId)}
          <button
            type="button"
            class="tab"
            class:active={selectedTag === tagId}
            onclick={() => selectTag(tagId)}
          >
            {getMessage(`projects.tag.${tagId}`)()}
          </button>
        {/each}
      </div>
    </div>

    {#snippet projectLink(link: string, mobileState: "hide" | "show")}
      <a href={link} class="project-link mobile-{mobileState}" target="_blank" rel="noopener noreferrer">
        {m["projects.cta"]()}
        <ExternalLink size={14} />
      </a>
    {/snippet}

    <div class="projects-grid">
      {#each filteredProjects as project, index (project.id)}
        <div class="project-card fade-in" class:delay-200={index % 2 === 1} id={`project-${project.id}`}>
          <div class="project-header">
            <h3 class="project-title">{project.title}</h3>
            {@render projectLink(project.link, "hide")}
          </div>
          <p class="project-description">{project.description}</p>
          {@render projectLink(project.link, "show")}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .projects-container {
    margin-top: 2rem;
  }

  .tabs-wrapper {
    position: relative;
    border-bottom: 1px solid var(--color-accent);
  }

  .tabs-scroll {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 1rem;
  }

  .tabs-scroll::-webkit-scrollbar {
    display: none;
  }

  .tab {
    flex: 0 0 auto;
    padding: 0.5rem 1.25rem;
    border: 1px solid var(--color-accent);
    border-radius: 999px;
    background: transparent;
    color: var(--color-accent);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 150ms ease-in-out,
      color 150ms ease-in-out;
  }

  .tab:hover {
    background: var(--color-accent-background);
  }

  .tab.active {
    background: var(--color-accent);
    color: var(--color-primary-bg);
  }

  .projects-grid {
    column-count: 3;
    column-gap: 2rem;
    padding: 2rem 0;
  }

  @media screen and (max-width: 1280px) {
    .projects-grid {
      column-count: 2;
    }
  }

  @media screen and (max-width: 768px) {
    .projects-grid {
      column-count: 2;
      column-gap: 1rem;
      padding: 1.5rem 0;
    }
  }

  .project-card {
    display: flex;
    flex-direction: column;
    break-inside: avoid;
    margin-bottom: 2rem;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 200ms ease-in-out;
  }

  /* mobile-only view button lives at card bottom; hidden on desktop.
     classes are applied via interpolation, so scope through the static
     .project-card parent with :global() to survive Svelte's CSS pruning */
  .project-card :global(.mobile-show) {
    display: none;
  }

  @media screen and (max-width: 768px) {
    .project-card {
      margin-bottom: 1rem;
      padding: 0.875rem;
    }

    .project-card :global(.mobile-hide) {
      display: none;
    }

    .project-card :global(.mobile-show) {
      display: inline-flex;
      align-self: flex-start;
      margin-top: 0.25rem;
    }
  }

  .project-card:hover {
    border-color: var(--color-accent);
  }

  .project-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .project-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.3;
  }

  @media screen and (max-width: 768px) {
    .project-title {
      font-size: 1.1rem;
    }
  }

  .project-link {
    display: inline-flex;
    align-items: center;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 150ms linear;
    gap: 0.5rem;
    color: var(--color-accent);
  }

  .project-link:hover {
    color: var(--color-accent-hover);
  }

  .project-description {
    color: var(--color-text-secondary);
    margin-bottom: 1.5rem;
    font-size: 1rem;
    line-height: 1.6;
  }

  @media screen and (max-width: 768px) {
    .project-description {
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      line-height: 1.5;
    }
  }
</style>
