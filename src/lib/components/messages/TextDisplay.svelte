<script lang="ts">
  import RemoveButton from "./RemoveButton.svelte";

  type Props = {
    content: string;
  } & ComponentWithRemoveHandler;

  let { content = $bindable(""), onRemove }: Props = $props();
</script>

<div class="relative">
  <textarea
    class="flex field-sizing-content h-auto w-full resize-none border-1 border-transparent bg-transparent p-1 outline-none hover:border-gray-500/50 focus:border-gray-500/50 active:border-gray-500/50"
    bind:value={content}
    rows={2}
  >
  </textarea>
  <RemoveButton onClick={onRemove} />
</div>
