<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { localizeHref } from "$lib/paraglide/runtime";
</script>

<section class="section business-about" id="about">
  <div class="business-container">
    <h1 class="business-title">LukeZ Development by Luca Hentschel</h1>
    <p class="business-subtitle">{m["business.subtitle"]()}</p>

    <div class="business-info">
      <p>{@html m["business.description"]()}</p>
      <p>{@html m["business.projectsText"]({ projectsLink: localizeHref("/#projects") })}</p>
    </div>
  </div>
</section>

<style>
  .business-container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 2rem;
  }

  @media screen and (max-width: 768px) {
    .business-container {
      padding: 0 1rem;
    }
  }

  .business-about {
    padding-top: 8rem;
    padding-bottom: 5rem;
    text-align: center;
  }

  @media screen and (max-width: 768px) {
    .business-about {
      padding-top: 5rem;
      padding-bottom: 3rem;
    }
  }

  .business-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-accent) 60%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media screen and (max-width: 768px) {
    .business-title {
      font-size: 2.5rem;
    }
  }

  .business-subtitle {
    font-size: 1.5rem;
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
    font-weight: 500;
  }

  @media screen and (max-width: 768px) {
    .business-subtitle {
      font-size: 1.2rem;
    }
  }

  .business-info {
    max-width: 700px;
    margin: 0 auto;
  }

  .business-info p {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }
</style>
