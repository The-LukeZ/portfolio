<script lang="ts">
  import { getMessage, projects } from "$lib/index.js";
  import { ExternalLink } from "$lib/assets/index.js";
  import { m } from "$lib/paraglide/messages";
</script>

<section id="projects" class="section projects">
  <h2 class="section-title fade-in">{m["projects.title"]()}</h2>
  <div class="projects-container">
    {#each projects as group}
      <details open class="projects-section-accordion fade-in">
        <summary class="section-accordion-header">
          <span class="section-accordion-title">
            {getMessage(`projects.topic.${group.id}`)()}
          </span>
          <span class="section-accordion-icon"></span>
        </summary>
        <div class="projects-grid">
          {#each group.items as project, index}
            {@const projectMsgKey = `project-${project.id}`}
            <div class="project-card fade-in" class:delay-200={index % 2 === 1} id={projectMsgKey}>
              <div class="project-header">
                <h3 class="project-title">{getMessage(`${projectMsgKey}.title`)()}</h3>
                <a href={project.link} class="project-link" target="_blank" rel="noopener noreferrer">
                  {m["projects.cta"]()}
                  <ExternalLink size={14} />
                </a>
              </div>
              <div class="project-content">
                <p class="project-description">{getMessage(`${projectMsgKey}.description`)()}</p>
              </div>
            </div>
          {/each}
        </div>
      </details>
    {/each}
  </div>
</section>

<style>
  .projects {
    scroll-margin-top: calc(var(--nav-height) + 1rem);
  }

  .projects-section-accordion {
    margin: 2rem auto 0;
    background: var(--color-secondary-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 200ms ease-in-out;
  }

  .projects-section-accordion:hover {
    border-color: var(--color-accent);
  }

  .projects-section-accordion[open] {
    border-color: var(--color-accent);
  }

  .projects-section-accordion[open] .section-accordion-header {
    border-bottom: 1px solid var(--color-border);
  }

  .projects-section-accordion[open] .section-accordion-icon::after {
    transform: rotate(0deg);
  }

  .section-accordion-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    cursor: pointer;
    list-style: none;
    transition: background 200ms ease-in-out;
  }

  .section-accordion-header::-webkit-details-marker {
    display: none;
  }

  .section-accordion-header:hover {
    background: var(--color-accent-background);
  }

  .section-accordion-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  @media screen and (max-width: 768px) {
    .section-accordion-title {
      font-size: 1.1rem;
    }
  }

  .section-accordion-icon {
    position: relative;
    width: 20px;
    height: 20px;
  }

  .section-accordion-icon::before,
  .section-accordion-icon::after {
    content: "";
    position: absolute;
    background: var(--color-accent);
    transition: transform 200ms ease-in-out;
  }

  .section-accordion-icon::before {
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    transform: translateY(-50%);
  }

  .section-accordion-icon::after {
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    transform: translateX(-50%) rotate(90deg);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    padding: 2rem;
    animation: accordionSlide 0.3s ease-out;
  }

  @media screen and (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 1.5rem;
    }
  }

  .project-card {
    min-width: 0;
    background: var(--color-primary-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1.5rem;
    scroll-margin-top: calc(var(--nav-height) + 1rem);
    transition: all 200ms ease-in-out;
  }

  .project-card:hover {
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

  @keyframes accordionSlide {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
