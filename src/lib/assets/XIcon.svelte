<script lang="ts">
  import { cn } from "$lib";
  import type { ClassValue } from "svelte/elements";

  type IconProps = {
    class?: ClassValue;
    size?: string | number;
  };

  let { class: className, size }: IconProps = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={cn("lucide lucide-x-icon lucide-x", className)}
  style="width: {size}px; height: {size}px"
  ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
>
