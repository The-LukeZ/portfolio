<script lang="ts">
  import { cn } from "$lib";
  import { SeparatorSpacingSize as SpacingSize } from "discord-api-types/v10";
  import RemoveButton from "./RemoveButton.svelte";

  type Props = {
    divider?: boolean;
    spacing?: SpacingSize;
  } & ComponentWithRemoveHandler;

  let { divider = $bindable(true), spacing = $bindable(SpacingSize.Small), onRemove }: Props = $props();

  let paddingClass = $derived(spacing === SpacingSize.Small ? "py-2" : "py-4");
</script>

{#snippet paddingChanger()}
  <button
    onclick={() => (spacing = spacing === SpacingSize.Small ? SpacingSize.Large : SpacingSize.Small)}
    class={cn(
      "w-full rounded bg-gray-600/10 text-xs text-base-content transition-all duration-300 ease-in-out hover:bg-gray-600/30",
      spacing === SpacingSize.Small ? "py-1" : "py-3",
    )}
  >
    <span>{spacing === SpacingSize.Small ? "Small" : "Large"} Spacing</span>
  </button>
{/snippet}

<div
  class="relative flex min-h-10 w-full flex-col items-center transition-all duration-200 ease-in-out {paddingClass}"
>
  {@render paddingChanger()}
  <label class="flex w-full items-center gap-2">
    <input type="checkbox" class="checkbox checkbox-sm" bind:checked={divider} />
    <span class={cn("divider flex w-full transition", divider ? "divider-transparent" : "no-divider")}>
    </span>
  </label>
  {@render paddingChanger()}
  <RemoveButton onClick={onRemove} />
</div>

<style>
  .no-divider {
    &:before,
    &:after {
      background-color: transparent;
    }
  }
</style>
