<script lang="ts">
  import type { TTMediaGalleryComponent, TTMediaGalleryItem } from "$lib/server/db";
  import { toast } from "svelte-sonner";
  import MediaItem from "./MediaItem.svelte";
  import RemoveButton from "./RemoveButton.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import * as Dialog from "$lib/components/dialog/index.js";
  import { validateImageLink } from "$lib/utils/parser";

  type Props = Omit<TTMediaGalleryComponent, "type"> &
    ComponentWithRemoveHandler & {
      totalComponents: number;
    };

  let { items = $bindable([]), onRemove, totalComponents }: Props = $props();

  let layout = $derived(getLayout(items.length));
  let dialogOpen = $state(false);
  class ExpandedItem {
    index = $state(-1);
    item = $state<TTMediaGalleryItem | null>(null);
    urlInput = $state("");
    validUrl = $derived(validateImageLink(this.urlInput));
    debounceTimer: ReturnType<typeof setTimeout> | undefined;

    constructor(item: TTMediaGalleryItem | null, index = -1) {
      this.index = index;
      this.item = item;
      this.urlInput = item?.url || "";
      this.debounceTimer = undefined;
    }

    setItem(item: TTMediaGalleryItem, index: number) {
      this.item = item;
      this.index = index;
      this.urlInput = item?.url || "";
    }

    setUrl(value?: string) {
      if (this.item) this.item.url = value || "";
    }

    setDescription(value?: string) {
      if (this.item) this.item.description = value || "";
    }

    setSpoiler(value: boolean) {
      if (this.item) this.item.spoiler = value;
    }

    debounceUrlUpdate(value: string) {
      if (!this.item) return;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.setUrl(value);
      }, 500);
    }

    clear() {
      this.index = -1;
      this.item = null;
      this.urlInput = "";
    }
  }
  let expandedItem = new ExpandedItem(null);

  $effect(() => {
    if (expandedItem.validUrl) {
      expandedItem.debounceUrlUpdate(expandedItem.validUrl);
    } else if (expandedItem.item) {
      expandedItem.setUrl("");
    }
  });

  function getLayout(count: number) {
    switch (count) {
      case 1:
        return { class: "single", cols: 1, rows: 1 };
      case 2:
        return { class: "two", cols: 2, rows: 1 };
      case 3:
        return { class: "three", cols: 2, rows: 2 };
      case 4:
        return { class: "four", cols: 2, rows: 2 };
      case 5:
        return { class: "five", cols: 3, rows: 2 };
      case 6:
        return { class: "six", cols: 3, rows: 2 };
      case 7:
        return { class: "seven", cols: 4, rows: 2 };
      case 8:
        return { class: "eight", cols: 4, rows: 2 };
      case 9:
        return { class: "nine", cols: 5, rows: 2 };
      case 10:
        return { class: "ten", cols: 5, rows: 2 };
      default:
        return { class: "default", cols: 1, rows: 1 };
    }
  }

  function getItemClass(index: number, count: number): string {
    if ((count === 3 || count === 5 || count === 7 || count === 9) && index === 0) {
      return "first";
    }
    return "";
  }

  function addItem() {
    if (items.length >= 10) {
      toast.error("You can only have up to 10 media items in a gallery.");
      return;
    }
    items = [...items, { url: "", description: "" }];
  }
</script>

<div class="flex flex-col gap-2">
  <div
    class="media-gallery relative w-fit rounded border border-gray-500/50 p-4 {layout.class}"
    style="--cols: {layout.cols}; --rows: {layout.rows}"
  >
    {#each items as item, index}
      <MediaItem
        bind:item={() => items[index], (v) => (items[index] = v)}
        {index}
        onRemove={() => {
          items = items.filter((_, i) => i !== index);
          if (items.length === 0) {
            onRemove?.();
          }
        }}
        class={getItemClass(index, items.length)}
        onExpand={() => {
          expandedItem.setItem(item, index);
          dialogOpen = true;
        }}
      />
    {/each}
    <RemoveButton onClick={onRemove} />
  </div>
  {#if items.length < 10 && totalComponents < 40}
    <button
      class="btn self-start btn-outline btn-sm btn-neutral"
      onclick={addItem}
      aria-label="Add media item"
    >
      <Plus class="size-5" />
      Add Item
    </button>
  {/if}
</div>

<Dialog.Root bind:open={dialogOpen} onOpenChange={(isOpen) => !isOpen && expandedItem.clear()}>
  <Dialog.Content>
    <h3 class="mb-4 text-lg font-bold">Media Settings</h3>

    {#if expandedItem.item && expandedItem.index >= 0}
      <div class="flex flex-col gap-4">
        <!-- Input Fields -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Image URL</legend>
          <input
            type="url"
            class="input-bordered input w-full"
            class:input-error={!expandedItem.validUrl}
            bind:value={expandedItem.urlInput}
            placeholder="https://example.com/image.jpg"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Description (Alt Text)</legend>
          <input
            type="text"
            class="input-bordered input w-full"
            bind:value={() => expandedItem.item!.description ?? "", (v) => expandedItem.setDescription(v)}
            placeholder="Image description"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Options</legend>
          <label class="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              class="checkbox"
              bind:checked={() => expandedItem.item!.spoiler ?? false, (v) => expandedItem.setSpoiler(v)}
            />
            Spoiler
          </label>
        </fieldset>

        <!-- Image Preview -->
        {#if expandedItem.item.url}
          <div class="h-full w-full overflow-hidden rounded-lg border">
            <img
              src={expandedItem.item.url}
              alt={expandedItem.item.description || `Media ${expandedItem.index + 1}`}
              class="size-auto object-cover"
            />
          </div>
        {:else}
          <div
            class="flex h-32 w-full items-center justify-center rounded-lg bg-error/50 p-2 text-center text-wrap"
          >
            <span class="text-error-content">
              {!expandedItem.validUrl && expandedItem.item.url.length > 0
                ? "Image URL not valid"
                : "No image URL provided"}
            </span>
          </div>
        {/if}
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<style>
  .media-gallery {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    grid-template-rows: repeat(var(--rows), minmax(0, 1fr));
  }
</style>
