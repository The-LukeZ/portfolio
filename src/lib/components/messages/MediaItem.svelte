<script lang="ts">
  import { cn } from "$lib";
  import type { TTMediaGalleryItem, TTThumbnailComponent } from "$lib/server/db";
  import { fade } from "svelte/transition";
  import RemoveButton from "./RemoveButton.svelte";
  import Cog from "@lucide/svelte/icons/settings";

  type Props = {
    item: TTMediaGalleryItem | TTThumbnailComponent;
    index: number;
    onRemove?: () => void;
    class?: string;
    onExpand?: () => void;
  };

  let { item = $bindable(), index, onRemove, class: className = "", onExpand }: Props = $props();
</script>

<div class={cn("cog-trigger relative aspect-square max-w-50 min-w-10 overflow-visible rounded", className)}>
  {#if item.url}
    <img src={item.url} alt={item.description || `Media ${index + 1}`} class="h-full w-full object-cover" />
  {:else}
    <div class="aspect-square size-20 skeleton"></div>
  {/if}

  {#if item.spoiler}
    <!-- Display a little gradient to indicate a spoiler -->
    <div
      id="spoiler-gradient-{index}"
      class="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20"
      in:fade={{ duration: 200 }}
    ></div>
  {/if}

  <button
    class="cog absolute top-0 left-0 grid size-full place-items-center rounded-2xl bg-gray-600/30 opacity-0 transition-opacity hover:opacity-100"
    onclick={onExpand}
    aria-label="Edit media settings"
  >
    <Cog class="size-4" />
  </button>

  <RemoveButton onClick={onRemove} />
</div>

<!-- svelte-ignore css_unused_selector -->
<style>
  .cog-trigger:hover .cog {
    opacity: 1;
  }
</style>
