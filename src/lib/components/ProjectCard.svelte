<script lang="ts">
  import { Github } from "@lucide/svelte";

  type ProjectCardProps = {
    title: string;
    description: string;
    image: string;
    link: string;
    tags: string[];
  };

  let { title, description, image, link, tags }: ProjectCardProps = $props();
</script>

<div class="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs">
  <div class="relative aspect-video">
    <img
      src={image || "/placeholder.svg"}
      alt={title}
      class="h-full w-full object-cover transition-transform hover:scale-105"
    />
  </div>
  <div class="p-4">
    <h3 class="mb-2 text-xl font-semibold">{title}</h3>
    <p class="mb-4 text-sm text-muted-foreground">{description}</p>
    <div class="flex flex-wrap gap-2">
      {#each tags as tag}
        <span
          class="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10"
        >
          {tag}
        </span>
      {/each}
    </div>
  </div>
  <div class="p-4 pt-0">
    <a href={link} target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 text-sm hover:underline">
      <Github class="h-4 w-4" />
      View on GitHub
    </a>
  </div>
</div>
