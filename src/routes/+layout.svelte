<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { theme } from "$lib/stores/theme";
  import { fade } from "svelte/transition";

  let { children } = $props();

  onMount(() => {});
</script>

<div class="bg-background min-h-screen font-sans antialiased">
  {@render children()}
</div>
