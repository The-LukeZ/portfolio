<script lang="ts">
  import { page } from "$app/state";
  import Pegboard from "#lib/components/Pegboard.svelte";
  import { locales, localizeHref } from "#lib/paraglide/runtime.js";
  import "../app.css";

  let { children } = $props();
</script>

<Pegboard />

{@render children()}

<div style="display:none">
  {#each locales as locale}
    <a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
  {/each}
</div>
