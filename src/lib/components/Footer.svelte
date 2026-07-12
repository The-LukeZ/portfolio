<script lang="ts">
  import { defaultUnsplashImage } from "$lib/index.js";
  import { m } from "$lib/paraglide/messages";

  let {
    imageData,
    usingFallback,
  }: {
    imageData?: any;
    usingFallback?: boolean;
  } = $props();
</script>

<footer class="footer">
  <p>{@html m.footer()}</p>

  {#if imageData}
    <p class="image-attribution">
      Photo by
      <a href={imageData.authorProfileUrl} target="_blank">
        {imageData.authorName}
      </a>
      on
      <a href={imageData.htmlUrl} target="_blank">Unsplash</a>
    </p>
  {:else if usingFallback}
    <p class="image-attribution">
      Photo by
      <a href={defaultUnsplashImage.author.url} target="_blank">
        {defaultUnsplashImage.author.name}
      </a>
      on
      <a href={defaultUnsplashImage.htmlUrl} target="_blank">Unsplash</a>
    </p>
  {/if}
</footer>

<style>
  .footer {
    background-color: var(--color-primary-bg);
    text-align: center;
    padding: 2rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-secondary);
  }

  .image-attribution {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    opacity: 0.7;
  }
</style>
