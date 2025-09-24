<script lang="ts">
  import { emojiUrl, validateEmoji } from "$lib/utils/parser";
  import { Popover, DropdownMenu as Dropdown } from "bits-ui";
  import Smile from "@lucide/svelte/icons/smile";
  import Cog from "@lucide/svelte/icons/cog";
  import { onMount } from "svelte";
  import RemoveButton from "./RemoveButton.svelte";
  import { ButtonStyle } from "discord-api-types/v10";
  import { cn } from "$lib";

  type Props = {
    label?: string;
    url?: string;
    emoji?: string;
    /**
     * This customId is treated as the ID of the category this button belongs to.
     *
     * When clicked on a button with a customId of a category, a ticket creation process is triggered.
     */
    customId?: string;
    style: Exclude<ButtonStyle, ButtonStyle.Premium>;
    categories?: PartialCategory[] | null;
    /**
     * This callback is triggered when the user clicks on the category select dropdown.
     */
    onCategoryFetch?: () => Promise<void>;
  } & ComponentWithRemoveHandler;

  let {
    label = $bindable("Button"),
    url = $bindable(""),
    emoji = $bindable(""),
    style = $bindable(ButtonStyle.Link),
    customId = $bindable(""),
    categories,
    onCategoryFetch,
    onRemove = () => undefined,
  }: Props = $props();

  let emojiValid = $state(true);
  let emojiBuffer = $state(emoji);

  function handleEmojiBlur() {
    emoji = emojiBuffer;
  }

  const buttonStyleLabels = {
    [ButtonStyle.Primary]: "Primary",
    [ButtonStyle.Secondary]: "Secondary",
    [ButtonStyle.Success]: "Success",
    [ButtonStyle.Danger]: "Danger",
    [ButtonStyle.Link]: "Link",
  };

  const buttonStyleClasses = {
    base: "discord-btn",
    [ButtonStyle.Primary]: "primary",
    [ButtonStyle.Secondary]: "secondary",
    [ButtonStyle.Success]: "success",
    [ButtonStyle.Danger]: "danger",
    [ButtonStyle.Link]: "link",
  };

  function setStyle(newStyle: Props["style"]) {
    console.log("Setting style to", newStyle);
    if (newStyle === ButtonStyle.Link) customId = "";
    url = newStyle === ButtonStyle.Link ? "https://example.com" : "";
    if (style !== newStyle) style = newStyle;
  }

  onMount(() => {
    if (!url) {
      url = "https://example.com";
    }
  });
</script>

<!-- Imitate Discord's button component -->
<div
  class={cn(
    "relative w-fit max-w-96 truncate overflow-visible",
    buttonStyleClasses.base,
    buttonStyleClasses[style],
  )}
>
  <!-- Emoji Popover -->
  <Popover.Root>
    <Popover.Trigger class="btn btn-square btn-ghost btn-xs">
      <div>
        {#if emoji.length > 0}
          {@const parsed = validateEmoji(emoji)}
          {@const emojiData = parsed ? emojiUrl(parsed, undefined, 64) : null}
          {#if emojiData && !emojiData.custom}
            <span class="size-[1.1rem]">{emojiData.output}</span>
          {:else if emojiData?.custom}
            <img class="size-[1.1rem]" src={emojiData.output} alt="Button Emoji" />
          {:else}
            <span
              class="animate-pulse-fast size-[1.1rem]"
              {@attach () => {
                emojiValid = false;
                return () => (emojiValid = true);
              }}
            >
              ❌
            </span>
          {/if}
        {:else}
          <Smile class="size-4.5" />
        {/if}
      </div>
    </Popover.Trigger>
    <Popover.Content class="flex w-xs flex-col rounded p-2 shadow-lg" sideOffset={5}>
      <!-- Emoji Input Binding -->
      <input
        type="text"
        class="input-bordered input input-sm w-full"
        placeholder="<:emoji_name:emoji_id>"
        bind:value={emojiBuffer}
        onblur={handleEmojiBlur}
        min="4"
        max="100"
      />
    </Popover.Content>
  </Popover.Root>
  <div class="w-full">
    <input
      bind:value={label}
      type="text"
      aria-label="Button label"
      class="input-md field-sizing-content max-w-60 min-w-30 truncate"
    />
  </div>
  <!-- Button Config popover -->
  <Popover.Root>
    <Popover.Trigger class="btn btn-square btn-ghost btn-xs" onclick={onCategoryFetch}>
      <Cog class="size-4.5" />
    </Popover.Trigger>
    <Popover.Content
      class="relative z-10 flex w-xs flex-col gap-2 rounded-lg border border-gray-500 bg-base-300 p-2 shadow-lg"
    >
      <Dropdown.Root>
        <Dropdown.Trigger class="btn w-full rounded-xs btn-soft btn-sm btn-neutral">
          Style: {buttonStyleLabels[style]}
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content
            class="z-50 flex w-30 flex-col gap-1 rounded-lg border border-base-300 bg-base-200 p-2 shadow-lg"
          >
            {#each Object.entries(buttonStyleLabels) as [value, label]}
              <Dropdown.Item
                class="btn rounded-xs btn-ghost btn-sm btn-neutral"
                onclick={() => setStyle(Number(value) as any)}
              >
                {label}
              </Dropdown.Item>
            {/each}
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      {#if style === ButtonStyle.Link}
        <input
          type="url"
          class="input-bordered input input-sm w-full"
          placeholder="https://example.com"
          bind:value={url}
          required
        />
      {:else}
        <Dropdown.Root>
          <Dropdown.Trigger class="btn w-full rounded-xs text-left btn-soft btn-sm btn-accent">
            {#if categories && categories.length > 0 && customId && categories.find((c) => c._id === customId)}
              Category: {categories.find((c) => c._id === customId)?.name}
            {:else}
              Select Category
            {/if}
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content
              class="z-50 flex w-full min-w-44 flex-col gap-2 rounded-lg border border-base-300 bg-base-200 p-1.5"
            >
              {#if categories === null}
                <Dropdown.Item class="btn cursor-not-allowed btn-ghost btn-sm btn-neutral" disabled>
                  Loading...
                </Dropdown.Item>
              {:else if categories && categories.length > 0}
                {#each categories as category}
                  <Dropdown.Item
                    class="btn rounded-xs btn-ghost btn-sm btn-accent"
                    onclick={() => (customId = category._id)}
                  >
                    {category.name}
                  </Dropdown.Item>
                {/each}
              {:else}
                <Dropdown.Item class="btn cursor-not-allowed btn-ghost btn-sm btn-neutral">
                  No categories found
                </Dropdown.Item>
              {/if}
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>
      {/if}
    </Popover.Content>
  </Popover.Root>

  <RemoveButton onClick={onRemove} />
</div>
