<script lang="ts">
  import { m } from "$lib/paraglide/messages";
</script>

<section id="home" class="hero">
  <div class="hero-content">
    <h1>LukeZ</h1>
    <p class="subtitle">{m["hero.subtitle"]()}</p>
    <a href="#about" class="cta-button">
      {m["hero.cta"]()}
    </a>
  </div>
</section>

<style>
  .hero {
    min-height: 100vh;
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

  .cta-button {
    display: inline-flex;
    align-items: center;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: all 200ms ease-in-out;
    background: var(--color-accent);
    color: var(--color-primary-bg);
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
  }

  .cta-button:hover {
    background: var(--color-accent-hover);
    transform: translateY(-2px);
  }
</style>
