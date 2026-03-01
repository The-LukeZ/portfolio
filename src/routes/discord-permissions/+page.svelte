<script lang="ts">
  import "./permissions.css";
  import { SvelteBitfield } from "$lib/bitfield.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import {
    GetGeneralPermissionsArray,
    GetTextPermissionsArray,
    GetVoicePermissionsArray,
  } from "$lib/permissions";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";

  const bitfield = new SvelteBitfield();

  onMount(() => {
    const hash = window.location.hash.slice(1);
    if (hash) bitfield.set(BigInt(hash));
  });

  $effect(() => {
    const value = bitfield.toString();
    const newHash = value === "0" ? "" : value;
    if (window.location.hash.slice(1) !== newHash) {
      goto(newHash ? `#${newHash}` : page.url.pathname, {
        replaceState: true,
        keepFocus: true,
        noScroll: true,
      });
    }
  });

  // ── Drag-select ───────────────────────────────────────────────
  let dragStart = $state<{ x: number; y: number } | null>(null);
  let dragCurrent = $state({ x: 0, y: 0 });
  let isDragging = $state(false);
  let hoveredPerms = $state<bigint[]>([]);
  let selectedPerms = $state<bigint[]>([]);
  let permissionsEl = $state<HTMLElement | undefined>();
  let dialogEl = $state<HTMLDialogElement | undefined>();

  const selectionBox = $derived(
    dragStart
      ? {
          left: Math.min(dragStart.x, dragCurrent.x),
          top: Math.min(dragStart.y, dragCurrent.y),
          width: Math.abs(dragCurrent.x - dragStart.x),
          height: Math.abs(dragCurrent.y - dragStart.y),
        }
      : null,
  );

  function getIntersecting(): bigint[] {
    if (!selectionBox || !permissionsEl) return [];
    const labels = permissionsEl.querySelectorAll<HTMLElement>("label[data-perm]");
    const result: bigint[] = [];
    for (const label of labels) {
      const r = label.getBoundingClientRect();
      if (
        r.left < selectionBox.left + selectionBox.width &&
        r.right > selectionBox.left &&
        r.top < selectionBox.top + selectionBox.height &&
        r.bottom > selectionBox.top
      ) {
        result.push(BigInt(label.dataset.perm!));
      }
    }
    return result;
  }

  function onMouseDown(e: MouseEvent) {
    document.body.style.userSelect = "none";
    document.body.style.pointerEvents = "none";
    if ((e.target as HTMLElement).closest("button, input, a")) return;
    if (e.button !== 0) return;
    dragStart = { x: e.clientX, y: e.clientY };
    dragCurrent = { x: e.clientX, y: e.clientY };
    isDragging = false;
    hoveredPerms = [];
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragStart) return;
    dragCurrent = { x: e.clientX, y: e.clientY };
    if (Math.hypot(dragCurrent.x - dragStart.x, dragCurrent.y - dragStart.y) > 5) {
      isDragging = true;
    }
    if (isDragging) hoveredPerms = getIntersecting();
  }

  function onMouseUp() {
    if (isDragging && hoveredPerms.length > 0) {
      selectedPerms = [...hoveredPerms];
      dialogEl?.showModal();
    }
    dragStart = null;
    isDragging = false;
    hoveredPerms = [];
    document.body.style.userSelect = "";
    document.body.style.pointerEvents = "";
  }

  function applyAction(action: "toggle" | "select" | "unselect") {
    for (const perm of selectedPerms) {
      if (action === "toggle") bitfield.toggle(perm);
      else if (action === "select") bitfield.set(perm);
      else bitfield.unset(perm);
    }
    dialogEl?.close();
  }

  function closeDialog() {
    dialogEl?.close();
  }

  const hoveredSet = $derived(new Set(hoveredPerms.map(String)));
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<!-- Drag selection rectangle -->
{#if isDragging && selectionBox && selectionBox.width > 5}
  <div
    class="selection-rect"
    style="left:{selectionBox.left}px;top:{selectionBox.top}px;width:{selectionBox.width}px;height:{selectionBox.height}px"
  ></div>
{/if}

<!-- Dialog -->
<dialog
  bind:this={dialogEl}
  ontransitionend={(e) => {
    if (e.propertyName === "opacity" && !dialogEl?.open) {
      selectedPerms = [];
    }
  }}
>
  <div>
    <p><strong>{selectedPerms.length}</strong> permission{selectedPerms.length !== 1 ? "s" : ""} selected</p>
    <div class="modal-actions">
      <button onclick={() => applyAction("select")}>Select all</button>
      <button onclick={() => applyAction("unselect")}>Unselect all</button>
      <button onclick={() => applyAction("toggle")}>Toggle</button>
      <button
        class="cancel"
        onclick={() => {
          closeDialog();
        }}>Cancel</button
      >
    </div>
  </div>
</dialog>

<svelte:head>
  <title>Discord Permissions Calculator</title>
  <meta name="description" content="Calculate Discord permissions integers" />
  <meta name="og:title" content="Discord Permissions Calculator" />
  <meta name="og:description" content="Calculate Discord permissions integers" />
</svelte:head>

<div style="padding: 1rem">
  <div class="bitfield-display">
    <div>
      <h1>Discord Permissions Calculator</h1>
    </div>
    <div>
      <p>Permissions Integer</p>
      <div class="bitfield-value">
        <button
          onclick={() => {
            navigator.clipboard.writeText(bitfield.toString()).then(() => {
              alert("Copied to clipboard!");
            });
          }}
        >
          Copy
        </button>
        <input
          value={bitfield.toString()}
          oninput={(e) => {
            const raw = e.currentTarget.value.trim();
            try {
              bitfield.bits = BigInt(raw || "0");
            } catch {
              // ignore invalid input
            }
          }}
        />
      </div>
    </div>
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="permissions" class:selecting={isDragging} bind:this={permissionsEl} onmousedown={onMouseDown}>
    <div>
      <h2>General Permissions</h2>
      {#each GetGeneralPermissionsArray() as perm}
        <label data-perm={perm.value.toString()} class:hovered={hoveredSet.has(perm.value.toString())}>
          <Checkbox bind:checked={() => bitfield.has(perm.value), () => bitfield.toggle(perm.value)} />
          {perm.label}
        </label>
      {/each}
    </div>

    <div>
      <h2>Text Permissions</h2>
      {#each GetTextPermissionsArray() as perm}
        <label data-perm={perm.value.toString()} class:hovered={hoveredSet.has(perm.value.toString())}>
          <Checkbox bind:checked={() => bitfield.has(perm.value), () => bitfield.toggle(perm.value)} />
          {perm.label}
        </label>
      {/each}
    </div>

    <div>
      <h2>Voice Permissions</h2>
      {#each GetVoicePermissionsArray() as perm}
        <label data-perm={perm.value.toString()} class:hovered={hoveredSet.has(perm.value.toString())}>
          <Checkbox bind:checked={() => bitfield.has(perm.value), () => bitfield.toggle(perm.value)} />
          {perm.label}
        </label>
      {/each}
    </div>
  </div>
</div>

<div class="footer">
  <small>
    Are there any permissions missing?
    <a href="https://github.com/The-LukeZ/portfolio/issues/new">Let me know!</a>
  </small>
</div>
