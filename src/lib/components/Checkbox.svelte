<script lang="ts">
  import type { Snippet } from "svelte";

  let { checked = $bindable<boolean>(false), children }: { checked?: boolean; children?: Snippet } = $props();
</script>

<button class="toggle" data-state={checked ? "checked" : "unchecked"} onclick={() => (checked = !checked)}>
  <span class="sr-only">Toggle checkbox</span>
</button>
