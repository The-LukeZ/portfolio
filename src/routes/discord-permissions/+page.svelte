<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { SvelteBitfield } from "#lib/bitfield.svelte.ts";
  import Footer from "#lib/components/Footer.svelte";
  import Header from "#lib/components/Header.svelte";
  import { m } from "#lib/paraglide/messages.js";
  import {
    GetGeneralPermissionsArray,
    GetTextPermissionsArray,
    GetVoicePermissionsArray,
  } from "#lib/permissions.ts";
  import { onMount, tick } from "svelte";

  type Perm = { label: string; value: bigint; bit: number };

  /** Discord permission integers are unsigned 64-bit values. */
  const MAX = BigInt(1) << BigInt(64);
  const APP_ID_KEY = "lz-discord-app-id";

  const withBit = (perms: { label: string; value: bigint }[]): Perm[] =>
    perms.map((p) => ({ ...p, bit: p.value.toString(2).length - 1 }));

  const groups = [
    { id: "general", name: m["permissions.general"], perms: withBit(GetGeneralPermissionsArray()) },
    { id: "text", name: m["permissions.text"], perms: withBit(GetTextPermissionsArray()) },
    { id: "voice", name: m["permissions.voice"], perms: withBit(GetVoicePermissionsArray()) },
  ];

  /** Parses a user- or URL-supplied integer. Returns null when it is not a valid permissions value. */
  function parseBits(raw: string): bigint | null {
    const s = raw.trim();
    if (s === "") return BigInt(0);
    if (!/^\d+$/.test(s)) return null;
    const value = BigInt(s);
    return value < MAX ? value : null;
  }

  const bitfield = new SvelteBitfield();
  const bits = $derived(bitfield.toString());
  const setCount = $derived(bitfield.bits.toString(2).replaceAll("0", "").length);

  // ── URL hash: old links point at /discord-permissions#<integer> ──
  let hydrated = $state(false);

  function readHash() {
    let raw = "";
    try {
      raw = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    const value = parseBits(raw);
    if (value !== null) bitfield.bits = value;
  }

  onMount(() => {
    readHash();
    hydrated = true;
    try {
      appId = localStorage.getItem(APP_ID_KEY) ?? "";
    } catch {
      // storage blocked: the field just starts empty
    }
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  });

  $effect(() => {
    if (!hydrated) return;
    const newHash = bits === "0" ? "" : bits;
    if (window.location.hash.slice(1) !== newHash) {
      goto(newHash ? `#${newHash}` : page.url.pathname, { replace: true, reset: false });
    }
  });

  // ── Integer field ──
  let intFocused = $state(false);
  let draft = $state("");
  let draftInvalid = $state(false);

  function onIntInput(e: Event & { currentTarget: HTMLInputElement }) {
    draft = e.currentTarget.value;
    const value = parseBits(draft);
    draftInvalid = value === null;
    if (value !== null) bitfield.bits = value;
  }

  // ── Copy ──
  let copied = $state<"int" | "link" | null>(null);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  let copyFailed = $state<"int" | "link" | null>(null);

  async function copy(text: string, which: "int" | "link") {
    copyFailed = null;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard blocked: select the value so a manual Ctrl+C works.
      copyFailed = which;
      if (which === "int") {
        const field = document.getElementById("perm-int") as HTMLInputElement | null;
        field?.focus();
        field?.select();
      }
      return;
    }
    copied = which;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = null), 1600);
  }

  // ── Bot invite ──
  let appId = $state("");
  const appIdClean = $derived(appId.trim());
  const appIdValid = $derived(/^\d{17,20}$/.test(appIdClean));
  const inviteUrl = $derived(
    appIdValid
      ? `https://discord.com/oauth2/authorize?client_id=${appIdClean}&permissions=${bits}&integration_type=0&scope=bot+applications.commands`
      : null,
  );

  function onAppIdInput(e: Event & { currentTarget: HTMLInputElement }) {
    appId = e.currentTarget.value;
    try {
      localStorage.setItem(APP_ID_KEY, appId.trim());
    } catch {
      // not persisted, still usable
    }
  }

  // ── Filter ──
  let query = $state("");
  const q = $derived(query.trim().toLowerCase());
  const visible = $derived(
    groups.map((g) => ({
      ...g,
      shown: q ? g.perms.filter((p) => p.label.toLowerCase().includes(q)) : g.perms,
    })),
  );
  const anyShown = $derived(visible.some((g) => g.shown.length > 0));

  // ── Drag-select ──
  let columnsEl = $state<HTMLElement>();
  let barEl = $state<HTMLElement>();
  let dragStart = $state<{ x: number; y: number } | null>(null);
  let dragCurrent = $state({ x: 0, y: 0 });
  let isDragging = $state(false);
  let hovered = $state<string[]>([]);
  let pending = $state<string[]>([]);
  let barPos = $state<{ x: number; y: number } | null>(null);

  const marked = $derived(new Set(isDragging ? hovered : pending));

  const rect = $derived(
    dragStart
      ? {
          left: Math.min(dragStart.x, dragCurrent.x),
          top: Math.min(dragStart.y, dragCurrent.y),
          width: Math.abs(dragCurrent.x - dragStart.x),
          height: Math.abs(dragCurrent.y - dragStart.y),
        }
      : null,
  );

  function intersecting(): string[] {
    if (!rect || !columnsEl) return [];
    const found = new Set<string>();
    for (const row of columnsEl.querySelectorAll<HTMLElement>("[data-perm]")) {
      const r = row.getBoundingClientRect();
      if (
        r.left < rect.left + rect.width &&
        r.right > rect.left &&
        r.top < rect.top + rect.height &&
        r.bottom > rect.top
      ) {
        found.add(row.dataset.perm!);
      }
    }
    return [...found];
  }

  /** Closes the action bar. Keyboard-driven closes hand focus back to the first marked row. */
  function closeBar(restoreFocus = false) {
    const first = pending[0];
    barPos = null;
    pending = [];
    if (restoreFocus && first && columnsEl) {
      columnsEl
        .querySelector<HTMLInputElement>(`[data-perm="${first}"] input`)
        ?.focus({ preventScroll: true });
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, button, a, [data-bar]")) return;
    closeBar();
    dragStart = { x: e.clientX, y: e.clientY };
    dragCurrent = { x: e.clientX, y: e.clientY };
    isDragging = false;
    hovered = [];
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragStart) return;
    dragCurrent = { x: e.clientX, y: e.clientY };
    if (!isDragging && Math.hypot(dragCurrent.x - dragStart.x, dragCurrent.y - dragStart.y) > 6) {
      isDragging = true;
      window.getSelection()?.removeAllRanges();
    }
    if (isDragging) hovered = intersecting();
  }

  /** A drag ends on a row label; swallow the click it fires so the row does not toggle. */
  function swallowClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  async function onPointerUp(e: PointerEvent) {
    if (!dragStart) return;
    const wasDragging = isDragging;
    const picked = hovered;
    dragStart = null;
    isDragging = false;
    hovered = [];
    if (!wasDragging) return;

    window.addEventListener("click", swallowClick, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", swallowClick, { capture: true }), 0);

    if (picked.length === 0 || !columnsEl) return;
    pending = picked;
    const box = columnsEl.getBoundingClientRect();
    const releaseY = e.clientY - box.top;
    barPos = { x: e.clientX - box.left, y: releaseY + 12 };
    await tick();
    if (barEl && barPos) {
      const half = barEl.offsetWidth / 2;
      const h = barEl.offsetHeight;
      // Keep the bar inside the cabinet: below the pointer when it fits, otherwise above it.
      let y = releaseY + 12;
      if (y + h > box.height) y = releaseY - h - 12;
      y = Math.min(Math.max(y, 0), Math.max(box.height - h, 0));
      barPos = { x: Math.min(Math.max(barPos.x, half), box.width - half), y };
      barEl.querySelector("button")?.focus({ preventScroll: true });
    }
  }

  function apply(action: "set" | "unset" | "toggle") {
    const values = pending.map((v) => BigInt(v));
    if (action === "set") bitfield.set(...values);
    else if (action === "unset") bitfield.unset(...values);
    else bitfield.toggle(...values);
    closeBar(true);
  }

  function onWindowPointerDown(e: PointerEvent) {
    if (barPos && barEl && !barEl.contains(e.target as Node)) closeBar();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && barPos) closeBar(true);
  }
</script>

<svelte:window
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointerdown={onWindowPointerDown}
  onkeydown={onKeydown}
/>

<svelte:head>
  <title>{m["permissions.pageTitle"]()}</title>
  <meta name="description" content={m["permissions.description"]()} />
  <meta name="keywords" content="discord, permissions, calculator, bitfield, integer, bot invite" />
  <meta property="og:title" content={m["permissions.pageTitle"]()} />
  <meta property="og:description" content={m["permissions.description"]()} />
  <meta property="og:url" content="https://thelukez.com/discord-permissions" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="LukeZ" />
  <meta name="author" content="LukeZ" />
  <link rel="canonical" href="https://thelukez.com/discord-permissions" />
</svelte:head>

<Header />

<main class="perm-page">
  <div class="wrap">
    <div class="intro">
      <h1>{m["permissions.title"]()}</h1>
      <p class="lede selectable">{m["permissions.description"]()}</p>
    </div>

    <div class="rail">
      <div class="cell">
        <div class="cell-head">
          <label class="plate-text" for="perm-int">{m["permissions.integer"]()}</label>
          <span class="stamp" aria-live="polite"
            >{m["permissions.setCount"]({ count: String(setCount) })}</span
          >
        </div>
        <div class="field-row">
          <input
            id="perm-int"
            class="field int-field"
            inputmode="numeric"
            autocomplete="off"
            spellcheck="false"
            value={intFocused ? draft : bits}
            aria-invalid={draftInvalid}
            aria-describedby={draftInvalid ? "perm-int-error" : undefined}
            onfocus={() => {
              draft = bits;
              intFocused = true;
            }}
            onblur={() => {
              intFocused = false;
              draftInvalid = false;
            }}
            oninput={onIntInput}
          />
          <button class="btn primary" onclick={() => copy(bits, "int")}>
            {copied === "int" ? m["permissions.copied"]() : m["permissions.copy"]()}
          </button>
          <button class="btn utility" onclick={() => bitfield.clear()} disabled={bits === "0"}>
            {m["permissions.clear"]()}
          </button>
        </div>
        {#if draftInvalid}
          <p class="field-error" id="perm-int-error">{m["permissions.invalid"]()}</p>
        {:else if copyFailed === "int"}
          <p class="field-error" role="alert">{m["permissions.copyFailed"]()}</p>
        {/if}
      </div>

      <div class="cell">
        <div class="cell-head">
          <label class="plate-text" for="perm-app">{m["permissions.invite"]()}</label>
          <span class="stamp scope">bot + applications.commands</span>
        </div>
        <div class="field-row">
          <input
            id="perm-app"
            class="field"
            inputmode="numeric"
            autocomplete="off"
            spellcheck="false"
            placeholder={m["permissions.appIdPlaceholder"]()}
            aria-label={m["permissions.appId"]()}
            value={appId}
            aria-invalid={appIdClean !== "" && !appIdValid}
            aria-describedby={appIdClean !== "" && !appIdValid ? "perm-app-error" : undefined}
            oninput={onAppIdInput}
          />
          <button
            class="btn primary"
            disabled={!inviteUrl}
            onclick={() => inviteUrl && copy(inviteUrl, "link")}
          >
            {copied === "link" ? m["permissions.copied"]() : m["permissions.copyLink"]()}
          </button>
          {#if inviteUrl}
            <a class="btn utility" href={inviteUrl} target="_blank" rel="noopener noreferrer">
              {m["permissions.open"]()}
            </a>
          {:else}
            <button class="btn utility" disabled>{m["permissions.open"]()}</button>
          {/if}
        </div>
        {#if appIdClean !== "" && !appIdValid}
          <p class="field-error" id="perm-app-error">{m["permissions.appIdInvalid"]()}</p>
        {:else if copyFailed === "link" && inviteUrl}
          <p class="field-error" role="alert">
            {m["permissions.copyLinkFailed"]()}
            <span class="invite-url selectable">{inviteUrl}</span>
          </p>
        {/if}
      </div>
    </div>

    <div class="toolbar">
      <div class="search">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.75" />
          <path d="m10.5 10.5 3.5 3.5" />
        </svg>
        <input
          type="search"
          class="field"
          placeholder={m["permissions.filter"]()}
          aria-label={m["permissions.filter"]()}
          bind:value={query}
        />
      </div>
      <p class="hint">{m["permissions.hint"]()}</p>
    </div>

    {#if !anyShown}
      <p class="no-match" role="status">{m["permissions.noMatch"]({ query: query.trim() })}</p>
    {/if}

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="cabinet"
      class:dragging={isDragging}
      class:hidden={!anyShown}
      bind:this={columnsEl}
      onpointerdown={onPointerDown}
    >
      {#each visible as g (g.id)}
        {@const on = g.perms.filter((p) => bitfield.has(p.value)).length}
        <section class="group" class:empty={g.shown.length === 0} aria-labelledby="group-{g.id}">
          <div class="group-head">
            <h2 id="group-{g.id}" class="tape">{g.name()}</h2>
            <span class="stamp">{on}/{g.perms.length}</span>
            <div class="group-actions">
              <button
                class="btn utility small"
                aria-label={q
                  ? m["permissions.selectShown"]({ group: g.name() })
                  : m["permissions.selectGroup"]({ group: g.name() })}
                disabled={g.shown.length === 0}
                onclick={() => bitfield.set(...g.shown.map((p) => p.value))}>{m["permissions.all"]()}</button
              >
              <button
                class="btn utility small"
                aria-label={q
                  ? m["permissions.clearShown"]({ group: g.name() })
                  : m["permissions.clearGroup"]({ group: g.name() })}
                disabled={g.shown.length === 0}
                onclick={() => bitfield.unset(...g.shown.map((p) => p.value))}
                >{m["permissions.none"]()}</button
              >
            </div>
          </div>
          <ul class="rows" role="list">
            {#each g.shown as p (p.value)}
              {@const checked = bitfield.has(p.value)}
              <li>
                <label
                  class="row"
                  class:on={checked}
                  class:marked={marked.has(p.value.toString())}
                  data-perm={p.value.toString()}
                >
                  <input
                    type="checkbox"
                    {checked}
                    onchange={(e) =>
                      e.currentTarget.checked ? bitfield.set(p.value) : bitfield.unset(p.value)}
                  />
                  <span class="box" aria-hidden="true">
                    <svg viewBox="0 0 12 12"><path d="M2.5 6.25 5 8.75l4.75-5.5" /></svg>
                  </span>
                  <span class="name">{p.label}</span>
                  <span class="bit" title="1 << {p.bit} = {p.value}">{p.bit}</span>
                </label>
              </li>
            {/each}
          </ul>
        </section>
      {/each}

      {#if barPos}
        <div
          class="action-bar"
          data-bar
          role="toolbar"
          aria-label={m["permissions.picked"]({ count: String(pending.length) })}
          bind:this={barEl}
          style:left="{barPos.x}px"
          style:top="{barPos.y}px"
        >
          <span class="stamp">{m["permissions.picked"]({ count: String(pending.length) })}</span>
          <button class="btn primary small" onclick={() => apply("set")}>{m["permissions.set"]()}</button>
          <button class="btn utility small" onclick={() => apply("unset")}>{m["permissions.clear"]()}</button>
          <button class="btn utility small" onclick={() => apply("toggle")}
            >{m["permissions.toggle"]()}</button
          >
          <button class="btn utility small" onclick={() => closeBar(true)}>{m["permissions.cancel"]()}</button
          >
        </div>
      {/if}
    </div>

    <p class="missing">
      {m["permissions.missing"]()}
      <a href="https://github.com/The-LukeZ/portfolio/issues/new" target="_blank" rel="noopener noreferrer"
        >{m["permissions.report"]()}</a
      >
    </p>
  </div>
</main>

<Footer />

{#if isDragging && rect}
  <div
    class="marquee"
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px"
  ></div>
{/if}

<style>
  .perm-page {
    min-height: calc(100vh - var(--nav-height));
  }

  .wrap {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  /* ---- Intro ---- */
  .intro {
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: clamp(1.75rem, 2.6vw, 2.5rem);
    font-weight: 800;
    font-stretch: 72%;
    line-height: 0.95;
    text-transform: uppercase;
    color: var(--ink);
    text-wrap: balance;
  }

  .lede {
    margin-top: 0.75rem;
    max-width: 60ch;
    color: var(--ink-2);
  }

  /* ---- Readout rail ---- */
  .rail {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--steel-0);
    border: 1px solid var(--steel-edge);
    border-radius: 6px;
    box-shadow:
      inset 0 1px 0 var(--steel-3),
      0 24px 48px -24px oklch(0% 0 0 / 0.7);
  }

  @media (min-width: 900px) and (min-height: 760px) {
    .rail {
      position: sticky;
      top: calc(var(--nav-height) + 0.5rem);
      z-index: 5;
    }
  }

  .cell {
    min-width: 0;
    padding: 0.75rem 0.875rem 0.875rem;
    background: var(--steel-2);
    border: 1px solid var(--steel-edge);
    border-radius: 3px;
    box-shadow: inset 0 1px 0 var(--steel-hi);
  }

  .cell-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .plate-text,
  .group-head h2 {
    font-size: 0.875rem;
    font-weight: 700;
    font-stretch: 80%;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-2);
  }

  .stamp,
  .bit {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ink-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .field-row {
    display: flex;
    gap: 0.375rem;
  }

  .field {
    flex: 1;
    min-width: 0;
    background: var(--steel-1);
    border: 1px solid var(--steel-edge);
    border-radius: 2px;
    box-shadow: inset 0 2px 3px oklch(0% 0 0 / 0.35);
    color: var(--ink);
    font: inherit;
    font-size: 0.9375rem;
    padding: 0.45rem 0.65rem;
    transition: border-color 150ms var(--ease-out);
  }

  .field::placeholder {
    color: var(--ink-3);
  }

  .field:hover {
    border-color: var(--steel-hi);
  }

  .field:focus-visible {
    outline-offset: -1px;
    border-color: var(--label);
  }

  .field[aria-invalid="true"] {
    border-color: var(--label);
    box-shadow: 0 0 0 1px var(--label);
  }

  .int-field {
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 500;
    padding-block: 0.2rem;
    text-align: right;
  }

  .field-error {
    margin-top: 0.4rem;
    font-size: 0.8125rem;
    color: var(--ink-2);
  }

  /* ---- Buttons ---- */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 2px;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    transition:
      background-color 150ms var(--ease-out),
      border-color 150ms var(--ease-out),
      color 150ms var(--ease-out);
  }

  .btn.primary {
    min-width: 6.5rem;
    padding: 0.45rem 0.85rem;
    background: var(--label);
    border: 1px solid var(--label);
    color: var(--label-ink);
    font-weight: 700;
    font-size: 0.9375rem;
  }

  .btn.primary:hover:not(:disabled) {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
  }

  .btn.utility {
    padding: 0.3rem 0.7rem;
    background: var(--steel-1);
    border: 1px solid var(--steel-edge);
    color: var(--ink-2);
    font-size: 0.8125rem;
    font-weight: 600;
    font-stretch: 80%;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .btn.utility:hover:not(:disabled) {
    color: var(--ink);
    border-color: var(--steel-hi);
  }

  .btn.small {
    min-width: 0;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
  }

  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* A disabled primary drops its tape instead of showing a muddy orange. */
  .btn.primary:disabled {
    opacity: 1;
    background: var(--steel-1);
    border-color: var(--steel-edge);
    color: var(--ink-3);
  }

  /* ---- Toolbar ---- */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 1rem 1.5rem;
    flex-wrap: wrap;
    margin: 1.5rem 0 0.75rem;
  }

  .search {
    position: relative;
    display: flex;
    flex: 0 1 22rem;
  }

  .search svg {
    position: absolute;
    left: 0.65rem;
    top: 50%;
    width: 1rem;
    height: 1rem;
    translate: 0 -50%;
    fill: none;
    stroke: var(--ink-3);
    stroke-width: 1.5;
    stroke-linecap: round;
    pointer-events: none;
  }

  .search .field {
    padding-left: 2.1rem;
  }

  .search .field::-webkit-search-cancel-button {
    filter: grayscale(1) brightness(1.6);
  }

  .hint {
    font-size: 0.875rem;
    color: var(--ink-3);
  }

  .no-match {
    padding: 2rem 0;
    color: var(--ink-2);
  }

  /* ---- Cabinet of group columns ---- */
  .cabinet {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18.5rem, 1fr));
    align-items: start;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--steel-0);
    border: 1px solid var(--steel-edge);
    border-radius: 6px;
    box-shadow: inset 0 1px 0 var(--steel-3);
  }

  .cabinet.hidden {
    display: none;
  }

  .group {
    background: var(--steel-2);
    border: 1px solid var(--steel-edge);
    border-radius: 3px;
    overflow: hidden;
  }

  .group.empty {
    opacity: 0.5;
  }

  .group-head {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.55rem 0.6rem 0.55rem 0.75rem;
    background: var(--steel-1);
    border-bottom: 1px solid var(--steel-edge);
  }

  /* Group names are printed on label tape, like the drawer labels on the homepage. */
  .group-head h2.tape {
    padding: 0.2rem 0.5rem;
    background: var(--label);
    border: 1.5px solid var(--label);
    border-radius: 1px;
    color: var(--label-ink);
    font-size: 0.8125rem;
    font-stretch: 78%;
    letter-spacing: 0.03em;
    line-height: 1.15;
  }

  .invite-url {
    display: block;
    margin-top: 0.25rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--ink);
    word-break: break-all;
  }

  .group-actions {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
  }

  .rows {
    list-style: none;
  }

  .rows li + li {
    border-top: 1px solid var(--steel-1);
  }

  .row {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.65rem;
    padding: 0.4rem 0.75rem;
    min-height: 2.25rem;
    cursor: pointer;
    color: var(--ink-2);
    font-size: 0.9375rem;
    line-height: 1.3;
    transition:
      background-color 150ms var(--ease-out),
      color 150ms var(--ease-out);
  }

  .row:hover {
    background: var(--steel-3);
  }

  .row.on {
    color: var(--ink);
  }

  .row.marked {
    box-shadow: inset 0 0 0 2px var(--label);
  }

  .row input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    pointer-events: none;
  }

  .box {
    display: grid;
    place-items: center;
    width: 1.05rem;
    height: 1.05rem;
    border: 1.5px solid var(--steel-hi);
    border-radius: 1px;
    background: var(--steel-1);
    transition:
      background-color 150ms var(--ease-out),
      border-color 150ms var(--ease-out);
  }

  .box svg {
    width: 0.75rem;
    height: 0.75rem;
    fill: none;
    stroke: var(--label-ink);
    stroke-width: 2;
    stroke-linecap: square;
    opacity: 0;
  }

  .row:hover .box {
    border-color: var(--ink-3);
  }

  .row.on .box {
    background: var(--label);
    border-color: var(--label);
  }

  .row.on .box svg {
    opacity: 1;
  }

  .row input:focus-visible + .box {
    outline: 2px solid var(--label);
    outline-offset: 2px;
  }

  .bit {
    min-width: 1.5rem;
    text-align: right;
  }

  .cabinet.dragging .row {
    cursor: crosshair;
  }

  .cabinet.dragging .row:hover:not(.marked) {
    background: none;
  }

  /* ---- Drag marquee and action bar ---- */
  .marquee {
    position: fixed;
    z-index: 50;
    pointer-events: none;
    border: 1.5px solid var(--label);
    border-radius: 2px;
  }

  .action-bar {
    position: absolute;
    z-index: 20;
    translate: -50% 0;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem;
    background: var(--steel-1);
    border: 1px solid var(--label);
    border-radius: 3px;
    box-shadow:
      inset 0 1px 0 var(--steel-3),
      0 10px 18px -6px oklch(0% 0 0 / 0.6);
  }

  .action-bar .stamp {
    padding: 0 0.4rem;
    color: var(--ink-2);
  }

  @media (prefers-reduced-motion: no-preference) {
    .action-bar {
      animation: bar-in 220ms var(--ease-out);
    }

    @keyframes bar-in {
      from {
        opacity: 0;
        translate: -50% -4px;
      }
    }
  }

  .missing {
    margin-top: 1.25rem;
    font-size: 0.875rem;
    color: var(--ink-3);
  }

  /* ---- Narrow screens ---- */
  @media (max-width: 900px) {
    .rail {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .wrap {
      padding: 1.75rem 1rem 3rem;
    }

    .rail,
    .cabinet {
      padding: 0.5rem;
    }

    .field-row {
      flex-wrap: wrap;
    }

    .field-row .field {
      flex-basis: 100%;
    }

    .field-row .btn {
      flex: 1;
    }

    .hint,
    .scope {
      display: none;
    }

    .search {
      flex-basis: 100%;
    }
  }
</style>
