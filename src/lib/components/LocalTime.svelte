<script lang="ts">
  import { onMount } from "svelte";

  /**
   * A date that the server renders in UTC (stable output, no hydration mismatch) and the
   * browser replaces with the reader's locale and timezone after mount.
   */
  let { iso }: { iso: string } = $props();

  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });

  const text = $derived.by(() => {
    const date = new Date(iso);
    if (mounted) return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    return (
      new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(
        date,
      ) + " UTC"
    );
  });
</script>

<time datetime={iso}>{text}</time>
