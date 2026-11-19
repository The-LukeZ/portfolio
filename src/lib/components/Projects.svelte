<script lang="ts">
  import { tick } from "svelte";
  import { ExternalLink } from "#lib/assets/index.js";
  import { getMessage } from "#lib/index.js";
  import { m } from "#lib/paraglide/messages.js";
  import { getLocale } from "#lib/paraglide/runtime.js";
  import { projectsByLocale, type Project } from "#lib/projects/index.js";

  /** Order of the small-drawer rows. A project lands in the first row whose tag it carries. */
  const ROW_ORDER = ["discord-bot", "libraries", "websites", "other"] as const;

  type Row = { id: string; label: string; big: boolean; projects: Project[] };

  const projects = projectsByLocale[getLocale()] ?? projectsByLocale.en;

  const rows: Row[] = [
    {
      id: "main",
      label: m["projects.main"](),
      big: true,
      projects: projects.filter((p) => p.featured),
    },
    ...ROW_ORDER.map((tag) => ({
      id: tag,
      label: getMessage(`projects.tag.${tag}`)(),
      big: false,
      projects: projects.filter(
        (p) => !p.featured && (ROW_ORDER.find((t) => p.tags.includes(t)) ?? "other") === tag,
      ),
    })),
  ].filter((row) => row.projects.length > 0);

  /** Allow line breaks after dots, slashes and hyphens in long names like "IsMyCodeWorking.Today". */
  function breakable(title: string) {
    const escaped = title.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
    return escaped.replace(/([./-])(?=\S)/g, "$1<wbr>");
  }

  /** Keep hyphenated words like "end-to-end" on one line in the proof headline. */
  function keepHyphens(text: string) {
    const escaped = text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
    return escaped.replace(/(\S+-\S+)/g, '<span class="nowrap">$1</span>');
  }

  /** Open drawer per row (one at a time). */
  let open = $state<Record<string, string | null>>({});
  /** Last opened drawer per row, kept so the tray content stays put while it closes. */
  let shown = $state<Record<string, Project | null>>({});

  function toggle(row: Row, project: Project) {
    if (open[row.id] === project.id) {
      open[row.id] = null;
    } else {
      open[row.id] = project.id;
      shown[row.id] = project;
      // On narrow screens the tray can sit far below the drawer: bring it into view.
      tick().then(() => {
        const tray = document.getElementById(`tray-${row.id}`);
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        setTimeout(
          () => tray?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }),
          200,
        );
      });
    }
  }

  function close(row: Row) {
    const id = open[row.id];
    open[row.id] = null;
    if (id) document.getElementById(`drawer-${id}`)?.focus();
  }
</script>

<section id="projects" class="projects" aria-labelledby="projects-title">
  <div class="head">
    <h2 id="projects-title">{m["projects.title"]()}</h2>
    <p>{m["projects.subtitle"]()}</p>
    <span class="count mono">{m["projects.count"]({ count: String(projects.length) })}</span>
    <p class="more">{@html m["projects.more"]()}</p>
  </div>

  <div class="cabinet">
    {#each rows as row (row.id)}
      {@const current = shown[row.id]}
      {@const isOpen = !!open[row.id]}
      <section class="row" class:big={row.big} aria-labelledby="row-{row.id}">
        <h3 class="plate" id="row-{row.id}">
          {row.label}
          <span class="mono plate-count">{row.projects.length}</span>
        </h3>

        <ul class="drawers" role="list">
          {#each row.projects as project (project.id)}
            {@const expanded = open[row.id] === project.id}
            <li>
              {#if row.big}
                <article class="drawer drawer-big" class:pulled={expanded}>
                  <div class="label-line">
                    <span class="label">{project.title}</span>
                    <span class="part mono">{project.partNo}</span>
                  </div>
                  {#if project.proof}
                    <p class="proof">{@html keepHyphens(project.proof)}</p>
                  {/if}
                  {#if project.summary}
                    <p class="summary selectable">{project.summary}</p>
                  {/if}
                  <div class="actions">
                    <a href={project.link} class="visit" target="_blank" rel="noopener noreferrer">
                      {project.link.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      class="pull-btn"
                      id="drawer-{project.id}"
                      aria-expanded={expanded}
                      aria-controls="tray-{row.id}"
                      onclick={() => toggle(row, project)}
                    >
                      {expanded ? m["projects.close"]() : m["projects.details"]()}
                    </button>
                  </div>
                </article>
              {:else}
                <button
                  type="button"
                  class="drawer drawer-small"
                  class:pulled={expanded}
                  class:dormant={project.dormant}
                  id="drawer-{project.id}"
                  aria-expanded={expanded}
                  aria-controls="tray-{row.id}"
                  title={project.dormant ? m["projects.dormant"]() : undefined}
                  onclick={() => toggle(row, project)}
                >
                  <span class="label">{@html breakable(project.title)}</span>
                  <span class="part mono">{project.partNo}</span>
                </button>
              {/if}
            </li>
          {/each}
        </ul>

        <div class="tray" class:open={isOpen} id="tray-{row.id}" inert={!isOpen}>
          <div class="tray-inner">
            {#if current}
              <div class="tray-body">
                <div class="tray-head">
                  <h4 class="selectable">{current.title}</h4>
                  <span class="part mono">{current.partNo}</span>
                  {#if current.dormant}
                    <span class="dormant-note">{m["projects.dormant"]()}</span>
                  {/if}
                </div>
                <p class="description selectable">{current.description}</p>
                <div class="tray-actions">
                  <a href={current.link} class="tray-link" target="_blank" rel="noopener noreferrer">
                    {m["projects.cta"]()}
                    {current.title}
                    <ExternalLink size={14} />
                  </a>
                  <button type="button" class="tray-close" onclick={() => close(row)}>
                    {m["projects.close"]()}
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </section>
    {/each}
  </div>
</section>

<style>
  .projects {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0.5rem 1.5rem 5rem;
  }

  .head {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    margin-bottom: 1.25rem;
  }

  .head h2 {
    font-size: 1.75rem;
    font-weight: 800;
    font-stretch: 75%;
    text-transform: uppercase;
    letter-spacing: 0.01em;
  }

  .head p {
    color: var(--ink-2);
  }

  .head .more {
    flex-basis: 100%;
    color: var(--ink-3);
    font-size: 0.9375rem;
  }

  .more :global(a) {
    color: var(--ink-2);
    text-decoration: underline;
    text-decoration-color: var(--steel-hi);
    text-underline-offset: 0.2em;
  }

  .more :global(a:hover) {
    opacity: 1;
    color: var(--label);
    text-decoration-color: currentColor;
  }

  .count {
    margin-left: auto;
    font-size: 0.8125rem;
    color: var(--ink-3);
  }

  /* ---- Cabinet body ---- */
  .cabinet {
    background: var(--steel-0);
    border: 1px solid var(--steel-edge);
    border-radius: 6px;
    padding: 0.75rem;
    box-shadow:
      inset 0 1px 0 var(--steel-3),
      0 24px 48px -24px oklch(0% 0 0 / 0.7);
  }

  .row {
    display: grid;
    grid-template-columns: 1fr;
    padding: 0.75rem 0.25rem;
  }

  .row + .row {
    border-top: 1px solid var(--steel-2);
  }

  .plate {
    justify-self: start;
    margin: 0 0 0.625rem;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
    font-size: 0.875rem;
    font-weight: 700;
    font-stretch: 80%;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-2);
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--steel-2);
    border-radius: 2px;
    background: var(--steel-1);
  }

  .plate-count {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ink-3);
    letter-spacing: 0;
  }

  .drawers {
    list-style: none;
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  }

  .row.big .drawers {
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  }

  .drawers li {
    display: flex;
  }

  /* ---- Drawer fronts ---- */
  .drawer {
    position: relative;
    flex: 1;
    background: linear-gradient(to bottom, var(--steel-3), var(--steel-2));
    border: 1px solid var(--steel-edge);
    border-radius: 3px;
    box-shadow:
      inset 0 1px 0 var(--steel-hi),
      inset 0 -5px 0 var(--steel-1),
      0 2px 3px oklch(0% 0 0 / 0.35);
    transition:
      transform 300ms var(--ease-out),
      box-shadow 300ms var(--ease-out),
      border-color 150ms var(--ease-out);
  }

  /* recessed pull handle */
  .drawer::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 0.5rem;
    width: 2.75rem;
    height: 0.4375rem;
    translate: -50% 0;
    border-radius: 0 0 6px 6px;
    background: var(--steel-0);
    box-shadow: inset 0 2px 2px oklch(0% 0 0 / 0.6);
  }

  .drawer.pulled {
    transform: translateY(4px);
    border-color: var(--label);
    box-shadow:
      inset 0 1px 0 var(--steel-hi),
      inset 0 -5px 0 var(--steel-1),
      0 -6px 0 -2px var(--steel-0),
      0 10px 18px -6px oklch(0% 0 0 / 0.6);
  }

  .label {
    display: inline-block;
    max-width: 100%;
    background: var(--label);
    color: var(--label-ink);
    font-weight: 700;
    font-stretch: 78%;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    line-height: 1.15;
    padding: 0.3rem 0.55rem;
    border-radius: 1px;
    border: 1.5px solid var(--label);
    overflow-wrap: break-word;
    hyphens: manual;
    text-align: left;
  }

  .part {
    font-size: 0.75rem;
    color: var(--ink-3);
  }

  .drawer-small {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
    min-height: 4.625rem;
    padding: 0.625rem 0.625rem 1.125rem;
    cursor: pointer;
    font: inherit;
    color: inherit;
  }

  .drawer-small .label {
    font-size: 0.8125rem;
  }

  .drawer-small:hover {
    border-color: var(--steel-hi);
  }

  .drawer-small:hover:not(.pulled) {
    transform: translateY(-1px);
  }

  .drawer-small.dormant .label {
    background: transparent;
    color: var(--label);
  }

  .drawer-big {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 1.25rem 1.25rem 2rem;
  }

  .label-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .drawer-big .label {
    font-size: 1.5rem;
    padding: 0.35rem 0.7rem;
  }

  .proof {
    font-size: clamp(1.75rem, 2.6vw, 2.5rem);
    font-weight: 800;
    font-stretch: 72%;
    line-height: 1.05;
    letter-spacing: -0.005em;
    color: var(--ink);
    text-wrap: balance;
  }

  .proof :global(.nowrap) {
    white-space: nowrap;
  }

  .summary {
    color: var(--ink-2);
    font-size: 0.9375rem;
    line-height: 1.5;
    max-width: 48ch;
  }

  .actions {
    margin-top: auto;
    padding-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .visit {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--label);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: oklch(75% 0.179 58 / 0.4);
    text-underline-offset: 0.2em;
  }

  .visit:hover {
    opacity: 1;
    text-decoration-color: currentColor;
  }

  .pull-btn,
  .tray-close {
    background: var(--steel-1);
    border: 1px solid var(--steel-edge);
    border-radius: 2px;
    color: var(--ink-2);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    transition:
      color 150ms var(--ease-out),
      border-color 150ms var(--ease-out);
  }

  .pull-btn:hover,
  .tray-close:hover {
    color: var(--ink);
    border-color: var(--steel-hi);
  }

  /* ---- Tray (the pulled-out drawer contents) ---- */
  .tray {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 420ms var(--ease-out);
  }

  .tray.open {
    grid-template-rows: 1fr;
  }

  .tray-inner {
    overflow: hidden;
  }

  .tray-body {
    margin-top: 0.75rem;
    background: var(--steel-1);
    border: 1px solid var(--steel-2);
    border-radius: 3px;
    padding: 1.25rem 1.25rem 1.125rem;
    box-shadow: inset 0 8px 12px -8px oklch(0% 0 0 / 0.7);
    opacity: 0;
    translate: 0 -8px;
    transition:
      opacity 300ms var(--ease-out),
      translate 420ms var(--ease-out);
  }

  .tray.open .tray-body {
    opacity: 1;
    translate: 0 0;
  }

  .tray-head {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
    margin-bottom: 0.5rem;
  }

  .tray-head h4 {
    font-size: 1.25rem;
    font-weight: 700;
    font-stretch: 85%;
  }

  .dormant-note {
    font-size: 0.8125rem;
    color: var(--label);
  }

  .description {
    color: var(--ink-2);
    max-width: 70ch;
    text-wrap: pretty;
  }

  .tray-actions {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .tray-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--label);
    color: var(--label-ink);
    font-weight: 700;
    padding: 0.45rem 0.85rem;
    border-radius: 2px;
    transition: background 150ms var(--ease-out);
  }

  .tray-link:hover {
    opacity: 1;
    text-decoration: none;
    background: var(--color-accent-hover);
  }

  @media (max-width: 900px) {
    .row {
      grid-template-columns: 1fr;
    }

    .plate {
      justify-self: start;
      margin: 0 0 0.625rem;
      gap: 0.75rem;
    }
  }

  @media (max-width: 640px) {
    .projects {
      padding: 0.5rem 0.75rem 3.5rem;
    }

    .head {
      padding-inline: 0.25rem;
    }

    .cabinet {
      padding: 0.5rem;
    }

    /* Phones: small drawers shrink to single-line label tags that wrap like a parts list. */
    .row:not(.big) .drawers {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .row:not(.big) .drawers li {
      flex: 0 1 auto;
      max-width: 100%;
    }

    .drawer-small {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      min-height: 0;
      padding: 0.375rem 0.5rem 0.4375rem 0.375rem;
      box-shadow:
        inset 0 1px 0 var(--steel-hi),
        inset 0 -3px 0 var(--steel-1),
        0 1px 2px oklch(0% 0 0 / 0.35);
    }

    .drawer-small::after {
      display: none;
    }

    .drawer-small .label {
      padding: 0.2rem 0.4rem;
    }

    .drawer-small .part {
      font-size: 0.6875rem;
    }

    .row.big .drawers {
      grid-template-columns: 1fr;
    }

    .drawer-big .label {
      font-size: 1.25rem;
    }

    .drawer-small .label {
      font-size: 0.8125rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .drawer,
    .tray,
    .tray-body {
      transition: none;
    }
  }
</style>
