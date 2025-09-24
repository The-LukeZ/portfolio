<script lang="ts">
  import { cn, componentDefaults, componentOptions } from "$lib";
  import type { ICategory, TTContainerComponent } from "$lib/server/db";
  import { hexToNumber, numberToHex } from "$lib/utils/formatting";
  import Paintbrush from "@lucide/svelte/icons/paintbrush";
  import Eye from "@lucide/svelte/icons/eye";
  import EyeOff from "@lucide/svelte/icons/eye-off";
  import { ComponentType } from "discord-api-types/v10";
  import { Popover } from "bits-ui";
  import Plus from "@lucide/svelte/icons/plus";
  import Section from "./Section.svelte";
  import Separator from "./Separator.svelte";
  import TextDisplay from "./TextDisplay.svelte";
  import MediaGallery from "./MediaGallery.svelte";
  import RemoveButton from "./RemoveButton.svelte";
  import ActionRow from "./ActionRow.svelte";

  type Props = Omit<TTContainerComponent, "type"> &
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
    accent_color = $bindable(undefined),
    spoiler = $bindable(false),
    onRemove,
    totalComponents,
    categories,
    onCategoryFetch,
  }: Props = $props();

  // Filter out Container from options since containers can't contain containers
  const availableOptions = componentOptions.filter((option) => option.type !== ComponentType.Container);

  let selectorOpen = $state(false);

  function addComponent(type: keyof typeof componentDefaults) {
    components = [...components, { type, ...componentDefaults[type] } as any];
    selectorOpen = false;
  }
</script>

<!-- Basically like a discord embed with the accent color -->
<div
  class={cn(
    "container-component relative space-y-1 rounded border border-gray-600 py-3 pr-5 pl-3.5 transition duration-200 ease-in-out",
    spoiler && "bg-gradient-to-br from-violet-500/20 to-blue-500/20",
  )}
  style="--accentColor: {accent_color ? `#${numberToHex(accent_color)}` : 'transparent'};"
>
  {#each components as component, index (index)}
    {#if component.type === ComponentType.TextDisplay}
      <TextDisplay
        bind:content={component.content}
        onRemove={() => (components = components.filter((_, i) => i !== index))}
      />
    {:else if component.type === ComponentType.Section}
      <Section
        bind:components={component.components}
        bind:accessory={component.accessory}
        onRemove={() => (components = components.filter((_, i) => i !== index))}
        {totalComponents}
        {categories}
        {onCategoryFetch}
      />
    {:else if component.type === ComponentType.Separator}
      <Separator
        bind:divider={component.divider}
        bind:spacing={component.spacing}
        onRemove={() => (components = components.filter((_, i) => i !== index))}
      />
    {:else if component.type === ComponentType.MediaGallery}
      <MediaGallery
        bind:items={component.items}
        onRemove={() => (components = components.filter((_, i) => i !== index))}
        {totalComponents}
      />
    {:else if component.type === ComponentType.ActionRow}
      <ActionRow
        bind:components={component.components}
        onRemove={() => (components = components.filter((_, i) => i !== index))}
        {totalComponents}
        {categories}
        {onCategoryFetch}
      />
    {/if}
  {/each}

  <div class="mt-2">
    <Popover.Root bind:open={selectorOpen}>
      <Popover.Trigger class="btn btn-outline btn-sm btn-primary" disabled={totalComponents >= 40}>
        <Plus size={16} />
        Add Component
      </Popover.Trigger>
      <Popover.Content
        align="start"
        side="bottom"
        class="flex w-auto flex-col rounded bg-base-300 p-1 shadow-lg"
        sideOffset={4}
      >
        {#each availableOptions as option (option.type)}
          <button class="btn w-full justify-start btn-ghost" onclick={() => addComponent(option.type)}>
            {option.label}
          </button>
        {/each}
      </Popover.Content>
    </Popover.Root>
  </div>

  <div class="flex flex-row gap-2">
    <!-- Popover for setting accent color -->
    <Popover.Root>
      <Popover.Trigger class="btn btn-square btn-outline btn-sm btn-neutral" aria-label="Set Accent Color">
        <Paintbrush class="size-4" />
      </Popover.Trigger>
      <Popover.Content class="mt-1 flex flex-col rounded bg-base-300 p-2 shadow-lg" align="start">
        <input
          type="color"
          class="h-10 w-20 cursor-pointer rounded border-0 p-0"
          value={typeof accent_color === "number" ? numberToHex(accent_color, true) : "#000000"}
          onchange={(e) => {
            accent_color = hexToNumber(e.currentTarget.value.replace("#", ""));
          }}
        />
        <button
          class="btn btn-soft btn-sm btn-secondary"
          onclick={() => (accent_color = undefined)}
          aria-label="Clear accent color"
        >
          Clear
        </button>
      </Popover.Content>
    </Popover.Root>
    <!-- Button for toggling spoiler -->
    <button
      class="btn btn-square btn-outline btn-sm btn-neutral"
      onclick={() => (spoiler = !spoiler)}
      aria-label="Toggle Spoiler"
    >
      {#if !spoiler}
        <Eye class="size-4" />
      {:else}
        <EyeOff class="size-4" />
      {/if}
    </button>
  </div>

  <RemoveButton onClick={onRemove} />
</div>

<style>
  .container-component::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
    background-color: var(--accentColor, transparent);
  }
</style>
