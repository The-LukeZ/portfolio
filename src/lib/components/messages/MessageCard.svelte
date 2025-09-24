<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import type { APIPartialMessage } from "$lib/server/db";

  interface Props {
    message: DocumentWithId<APIPartialMessage, true>;
    isSelected?: boolean;
    showArrow?: boolean;
    onclick?: () => void;
  }

  let { message, isSelected = false, showArrow = false, onclick }: Props = $props();
</script>

<button
  class="w-full rounded-lg border p-3 text-left transition-colors {isSelected
    ? 'border-primary bg-primary text-primary-content'
    : 'border-2 border-base-100 bg-base-100 hover:border-primary'}"
  {onclick}
>
  <div class="flex items-center gap-2">
    <div class="w-full flex-1">
      <div class="truncate font-medium">{message.name}</div>
    </div>
    {#if showArrow}
      <ArrowRight class="size-4" />
    {/if}
  </div>
</button>
