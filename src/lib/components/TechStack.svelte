<script lang="ts">
  const technologies = [
    {
      category: "Frontend",
      skills: ["Svelte", "SvelteKit", "TypeScript/JS", "TailwindCSS"],
    },
    {
      category: "Backend",
      skills: ["Node.js", "REST APIs", "Python", "MongoDB", "SQL (MySQL)"],
    },
    {
      category: "DevOps",
      skills: ["Git", "Linux", "Nginx"],
    },
    {
      category: "Tools",
      skills: ["VS Code", "Figma", "GitHub"],
    },
  ];
</script>

<div class="grid gap-6 md:grid-cols-2">
  {#each technologies as tech}
    <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
      <h3 class="mb-4 text-lg font-semibold">{tech.category}</h3>
      <div class="flex flex-wrap gap-2">
        {#each tech.skills as skill}
          <span
            class="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20"
          >
            {skill}
          </span>
        {/each}
      </div>
    </div>
  {/each}
</div>
