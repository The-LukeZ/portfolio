<script lang="ts">
  let { disabled = false, checked = $bindable<boolean>(false) }: { disabled?: boolean; checked?: boolean } =
    $props();
</script>

<button
  class="toggle"
  data-state={checked ? "checked" : "unchecked"}
  onclick={() => (checked = !checked)}
  {disabled}
>
  <span class="sr-only">Toggle checkbox</span>
</button>
