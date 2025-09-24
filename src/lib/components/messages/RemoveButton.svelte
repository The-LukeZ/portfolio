<script lang="ts">
  import { cn } from "$lib";
  import XIcon from "@lucide/svelte/icons/x";
  let { onClick = () => undefined }: { onClick?: () => void } = $props();
</script>

<button
  class={cn(
    "absolute -top-2 -right-2 grid btn-circle size-5 place-items-center p-0 shadow-md transition-colors duration-75 btn-soft",
    "bg-error-content text-error hover:bg-error hover:text-error-content",
  )}
  aria-label="Remove component"
  onclick={onClick}
>
  <XIcon class="size-4" />
</button>
