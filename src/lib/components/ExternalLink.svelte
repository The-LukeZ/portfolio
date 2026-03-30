<script lang="ts">
  import type { Snippet } from "svelte";

  let { href, children }: { href: string; children: Snippet } = $props();
</script>

<a {href} target="_blank">
  {@render children()}
</a>
