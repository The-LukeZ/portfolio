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

    <div class="projects-grid">
      {#each filteredProjects as project, index (project.id)}
        <div class="project-card fade-in" class:delay-200={index % 2 === 1} id={`project-${project.id}`}>
          <div class="project-header">
            <h3 class="project-title">{project.title}</h3>
            <a href={project.link} class="project-link" target="_blank" rel="noopener noreferrer">
              {m["projects.cta"]()}
              <ExternalLink size={14} />
            </a>
          </div>
          <div class="project-content">
            <p class="project-description">{project.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .projects {
    scroll-margin-top: calc(var(--nav-height) + 1rem);
  }

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
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem 0;
  }

  @media screen and (max-width: 1024px) {
    .projects-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media screen and (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 1.5rem 0;
    }
  }

  .project-card {
    min-width: 0;
    background: var(--color-secondary-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
    scroll-margin-top: calc(var(--nav-height) + 1rem);
    transition: all 200ms ease-in-out;
  }

  .project-card:hover {
    border-color: var(--color-accent);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
</style>
