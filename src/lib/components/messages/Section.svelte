<script lang="ts">
  import {
    ButtonStyle,
    ComponentType,
    type APIButtonComponentWithCustomId,
    type APIButtonComponentWithURL,
  } from "discord-api-types/v10";
  import TextDisplay from "./TextDisplay.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import type { TTActionRowButton, TTSectionComponent, TTThumbnailComponent } from "$lib/server/db";
  import Button from "./Button.svelte";
  import { emojiStrToPartialEmoji, partialEmojiToStr, validateImageLink } from "$lib/utils/parser";
  import RemoveButton from "./RemoveButton.svelte";
  import { Popover } from "bits-ui";
  import MediaItem from "./MediaItem.svelte";
  import * as Dialog from "$lib/components/dialog/index.js";

  type Props = Omit<TTSectionComponent, "type" | "id"> &
    ComponentWithRemoveHandler & {
      totalComponents: number;
      categories?: PartialCategory[] | null;
      /**
       * This callback is triggered when the user clicks on the category select dropdown.
       */
      onCategoryFetch?: () => Promise<void>;
    };

  let {
    components = $bindable([]),
    accessory = $bindable(undefined),
    onRemove,
    totalComponents,
    categories,
    onCategoryFetch,
  }: Props = $props();

  function addAccessory(type: "btn" | "thumb") {
    if (type === "btn") {
      accessory = {
        type: ComponentType.Button,
        style: 5,
        label: "New Button",
        url: "",
        emoji: undefined,
      };
    } else {
      accessory = {
        type: ComponentType.Thumbnail,
        url: "",
      };
    }
  }

  function addTextDisplay() {
    if (components.length >= 3) return;
    components = [...components, { type: ComponentType.TextDisplay, content: "" }];
  }

  let accessorySelectorOpen = $state(false);
  let dialogOpen = $state(false);

  class ExpandedItem {
    item = $state<TTThumbnailComponent | null>(null);
    urlInput = $state("");
    validUrl = $derived(validateImageLink(this.urlInput));
    debounceTimer: ReturnType<typeof setTimeout> | undefined;

    constructor(item: any = null) {
      this.item = item;
      this.urlInput = item?.url || "";
      this.debounceTimer = undefined;
    }

    setItem(item: any) {
      this.item = item;
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
      this.item = null;
      this.urlInput = "";
    }
  }
  let expandedItem = new ExpandedItem(null);

  $inspect("expandedItem", expandedItem.item);

  $effect(() => {
    if (expandedItem.validUrl) {
      expandedItem.debounceUrlUpdate(expandedItem.validUrl);
    } else if (expandedItem.item) {
      expandedItem.setUrl("");
    }
  });
</script>

<!-- 
Text Displays on the left, attachment (button or image) on the right top
-->

<div class="relative z-auto grid grid-cols-[1fr_auto] gap-3 rounded border border-neutral/30 p-1">
  <div class="flex flex-col gap-1">
    {#each components as component, index}
      <TextDisplay
        bind:content={component.content}
        onRemove={() => (components = components.filter((_, i) => i !== index))}
      />
    {/each}
    {#if components.length < 3 && totalComponents < 40}
      <button class="btn w-fit btn-soft btn-sm" onclick={addTextDisplay} aria-label="Add text display">
        <Plus />
        Add Text Display
      </button>
    {/if}
  </div>
  <!-- Accessory (Button or Image) on the right -->
  <div class="flex items-center p-3.5">
    {#if accessory && accessory.type === ComponentType.Button}
      <!-- Button Accessory | We have to assert any because TypeScript is dumb -->
      <Button
        bind:style={accessory.style}
        bind:customId={
          () =>
            (accessory as TTActionRowButton).style !== ButtonStyle.Link
              ? (accessory as APIButtonComponentWithCustomId).custom_id
              : "",
          (v) => {
            if ((accessory as TTActionRowButton).style !== ButtonStyle.Link)
              (accessory as APIButtonComponentWithCustomId).custom_id = v;
          }
        }
        bind:label={accessory.label}
        bind:url={
          () => (accessory as APIButtonComponentWithURL).url || "",
          (v) => {
            (accessory as APIButtonComponentWithURL).url = v;
          }
        }
        bind:emoji={
          () => partialEmojiToStr((accessory as any).emoji),
          (v) => ((accessory as any).emoji = emojiStrToPartialEmoji(v))
        }
        onRemove={() => (accessory = undefined)}
        {categories}
        {onCategoryFetch}
      />
    {:else if accessory?.type === ComponentType.Thumbnail}
      <!-- Image Accessory -->
      <MediaItem
        index={0}
        bind:item={accessory}
        onRemove={() => (accessory = undefined)}
        onExpand={() => {
          expandedItem.setItem(accessory);
          dialogOpen = true;
        }}
      />
    {:else}
      <!-- No Accessory; We HAVE to allow this add button, even if it exceeds 40 components in total, because a section needs an accessory. -->
      <Popover.Root bind:open={accessorySelectorOpen}>
        <Popover.Trigger class="btn btn-square btn-outline btn-xl btn-primary">
          <Plus class="size-6" />
        </Popover.Trigger>
        <Popover.Content class="z-500 mt-1 rounded bg-base-300 p-1" align="end">
          <button class="btn btn-ghost" onclick={() => addAccessory("btn")} aria-label="Add Button Accessory">
            Button
          </button>
          <button
            class="btn btn-ghost"
            onclick={() => addAccessory("thumb")}
            aria-label="Add Image Accessory"
          >
            Image
          </button>
        </Popover.Content>
      </Popover.Root>
    {/if}
  </div>
  <RemoveButton onClick={onRemove} />
</div>

<Dialog.Root bind:open={dialogOpen} onOpenChange={(isOpen) => !isOpen && expandedItem.clear()}>
  <Dialog.Content>
    <h3 class="mb-4 text-lg font-bold">Image Settings</h3>

    {#if expandedItem.item}
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
          <p class="text-sm text-warning/60">The image should have a 1:1 aspect ratio (square)!</p>
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
          <div class="aspect-square h-full w-full overflow-hidden rounded-lg border">
            <img src={expandedItem.item.url} alt="Section thumbnail" class="size-40 object-cover" />
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
