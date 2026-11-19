<script lang="ts">
  import { m } from "#lib/paraglide/messages.js";
</script>

<section id="home" class="nameplate">
  <img src="/LukeZ.webp" alt="" width="96" height="96" class="avatar" />
  <div>
    <h1>LukeZ</h1>
    <p class="subtitle">{m["hero.subtitle"]()}</p>
  </div>
</section>

<style>
  .nameplate {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 2.75rem 1.5rem 1.75rem;
    display: flex;
    align-items: center;
    gap: 1.75rem;
  }

  .avatar {
    width: 96px;
    height: 96px;
    border-radius: 4px;
    border: 1px solid var(--steel-edge);
    flex-shrink: 0;
    object-fit: cover;
  }

  h1 {
    font-size: clamp(3rem, 8vw, 5.5rem);
    font-weight: 800;
    font-stretch: 72%;
    text-transform: uppercase;
    line-height: 0.9;
    letter-spacing: -0.01em;
  }

  .subtitle {
    margin-top: 0.75rem;
    font-size: clamp(1.0625rem, 2vw, 1.3125rem);
    color: var(--ink-2);
    max-width: 44ch;
    text-wrap: balance;
  }

  @media (max-width: 640px) {
    .nameplate {
      padding: 1.75rem 1rem 1.25rem;
      gap: 1rem;
      align-items: flex-start;
    }

    .avatar {
      width: 56px;
      height: 56px;
    }

    .subtitle {
      margin-top: 0.5rem;
    }
  }
</style>
