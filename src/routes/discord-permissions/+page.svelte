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
    if (hash) {
      bitfield.set(BigInt(hash));
    }
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
</script>

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

  <div class="permissions">
    <div>
      <h2>General Permissions</h2>
      {#each GetGeneralPermissionsArray() as perm}
        <label>
          <Checkbox bind:checked={() => bitfield.has(perm.value), () => bitfield.toggle(perm.value)} />
          {perm.label}
        </label>
      {/each}
    </div>

    <div>
      <h2>Text Permissions</h2>
      {#each GetTextPermissionsArray() as perm}
        <label>
          <Checkbox bind:checked={() => bitfield.has(perm.value), () => bitfield.toggle(perm.value)} />
          {perm.label}
        </label>
      {/each}
    </div>

    <div>
      <h2>Voice Permissions</h2>
      {#each GetVoicePermissionsArray() as perm}
        <label>
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
