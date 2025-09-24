<script lang="ts">
  import type { ICategory, IMessage, TTComponentInContainer } from "$lib/server/db";
  import { componentDefaults, componentOptions } from "$lib";
  import Plus from "@lucide/svelte/icons/plus";
  import { Popover } from "bits-ui";
  import { ComponentType } from "discord-api-types/v10";
  import TextDisplay from "./TextDisplay.svelte";
  import Section from "./Section.svelte";
  import Separator from "./Separator.svelte";
  import Container from "./Container.svelte";
  import MediaGallery from "./MediaGallery.svelte";
  import ActionRow from "./ActionRow.svelte";

  type Props = {
    components: IMessage["data"];
    totalComponents?: number;
    categories?: PartialCategory[] | null;
    /**
     * This callback is triggered when the user clicks on the category select dropdown.
     */
    onCategoryFetch?: () => Promise<void>;
  };

  let { components = $bindable([]), totalComponents = 0, categories, onCategoryFetch }: Props = $props();

  let selectorOpen = $state(false);

  function addComponent(type: keyof typeof componentDefaults) {
    console.log(`Adding component of type ${type} (${ComponentType[type]})`);
    components = [...components, { type, ...componentDefaults[type] } as any];
    selectorOpen = false;
  }

  /**
   * Calculates the total number of components, counting nested components within ActionRows and all other components.
   */
  function calculateComponentCount(componentList: IMessage["data"] | TTComponentInContainer[]): number {
    let count = 0;
    for (const component of componentList) {
      count += 1; // Count the component itself
      switch (component.type) {
        case ComponentType.ActionRow: // ActionRows can only contain buttons
          count += component.components.length;
          break;
        case ComponentType.Container: // Containers can contain any component type, except Containers
          count += calculateComponentCount(component.components);
          break;
        case ComponentType.Section: // Sections can contain text displays (.components) and an accessory.
          // The accessory counts as one component and usually must be provided.
          if (component.accessory) count += 1;
          count += component.components.length;
          break;
        case ComponentType.MediaGallery: // MediaGallery contains media items (.items)
          count += component.items.length;
          break;
        case ComponentType.TextDisplay: // TextDisplays count as one component
        case ComponentType.Separator: // Separators count as one component
        default:
          break;
      }
    }
    return count;
  }

  $effect(() => {
    totalComponents = calculateComponentCount(components);
  });
</script>

<div class="flex flex-col gap-4 rounded bg-[#1e2124] p-2">
  {#each components as component, index}
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
    {:else if component.type === ComponentType.ActionRow}
      <ActionRow
        bind:components={component.components}
        onRemove={() => (components = components.filter((_, i) => i !== index))}
        {totalComponents}
        {categories}
        {onCategoryFetch}
      />
    {:else if component.type === ComponentType.Container}
      <Container
        bind:components={component.components}
        bind:accent_color={component.accent_color}
        bind:spoiler={() => !!component.spoiler, (v) => (component.spoiler = v)}
        onRemove={() => (components = components.filter((_, i) => i !== index))}
        {totalComponents}
        {categories}
        {onCategoryFetch}
      />
    {:else if component.type === ComponentType.MediaGallery}
      <MediaGallery
        bind:items={component.items}
        onRemove={() => (components = components.filter((_, i) => i !== index))}
        {totalComponents}
      />
    {/if}
  {/each}
  <Popover.Root bind:open={selectorOpen}>
    <Popover.Trigger class="btn w-fit btn-outline btn-primary" disabled={totalComponents >= 40}>
      <Plus />
      Add Component
    </Popover.Trigger>
    <Popover.Content
      align="start"
      side="bottom"
      class="flex w-auto flex-col rounded bg-base-300 p-1 shadow-lg"
      sideOffset={4}
    >
      {#each componentOptions as option (option.type)}
        <button class="btn w-full justify-start btn-ghost" onclick={() => addComponent(option.type)}>
          {option.label}
        </button>
      {/each}
    </Popover.Content>
  </Popover.Root>
  {#if totalComponents >= 40}
    <p class="text-sm text-error">You have reached the maximum of 40 components.</p>
  {/if}
</div>
