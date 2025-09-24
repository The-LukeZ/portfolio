<script lang="ts">
  import { ButtonStyle } from "discord-api-types/v10";
  import Button from "./Button.svelte";
  import { emojiStrToPartialEmoji, partialEmojiToStr } from "$lib/utils/parser";
  import Plus from "@lucide/svelte/icons/plus";
  import { toast } from "svelte-sonner";
  import RemoveButton from "./RemoveButton.svelte";
  import type { TTActionRowButton } from "$lib/server/db";

  type Props = {
    components: TTActionRowButton[];
    totalComponents: number;
    categories?: PartialCategory[] | null;
    /**
     * This callback is triggered when the user clicks on the category select dropdown.
     */
    onCategoryFetch?: () => Promise<void>;
  } & ComponentWithRemoveHandler;

  let {
    components = $bindable([]),
    onRemove,
    totalComponents,
    categories,
    onCategoryFetch,
  }: Props = $props();

  function addButton() {
    if (components.length >= 5) {
      toast.error("You can only have up to 5 buttons in an action row.");
      return;
    }
    components = [
      ...components,
      {
        type: 2,
        style: 5,
        label: "New Button",
        url: "",
        emoji: undefined,
      },
    ];
  }
</script>

<div class="relative flex w-fit flex-row items-center gap-2 rounded border border-neutral/40 p-2">
  {#each components as btn, index}
    <Button
      {onCategoryFetch}
      {categories}
      onRemove={() => (components = components.filter((_, i) => i !== index))}
      bind:style={btn.style}
      bind:customId={
        () => (btn.style !== ButtonStyle.Link ? btn.custom_id : ""),
        (v) => {
          if (btn.style !== ButtonStyle.Link) btn.custom_id = v;
        }
      }
      bind:label={btn.label}
      bind:url={
        () => (btn as any).url || "",
        (v) => {
          (btn as any).url = v;
        }
      }
      bind:emoji={() => partialEmojiToStr(btn.emoji as any), (v) => (btn.emoji = emojiStrToPartialEmoji(v))}
    />
  {/each}
  {#if components.length < 5 && totalComponents < 40}
    <button
      class="btn btn-square btn-outline btn-sm btn-primary"
      class:ml-2={components.length > 1}
      onclick={addButton}
      aria-label="Add button"
    >
      <Plus class="size-5" />
    </button>
  {/if}
  <RemoveButton onClick={onRemove} />
</div>
