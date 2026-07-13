<script lang="ts">
  import { m } from "$lib/paraglide/messages";
</script>

<section id="home" class="hero">
  <div class="hero-content">
    <h1>LukeZ</h1>
    <h2 class="subtitle">{m["hero.subtitle"]()}</h2>
  </div>
</section>

<style>
  .hero {
    min-height: 60vh;
    padding: 6rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .hero-content {
    max-width: 800px;
  }

  .hero-content h1 {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-accent) 60%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media screen and (max-width: 768px) {
    .hero-content h1 {
      font-size: 2.5rem;
    }
  }

  .subtitle {
    font-size: 1.5rem;
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
  }

  @media screen and (max-width: 768px) {
    .subtitle {
      font-size: 1.2rem;
    }
  }
</style>
