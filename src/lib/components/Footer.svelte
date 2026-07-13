<script lang="ts">
  import { m } from "$lib/paraglide/messages";
</script>

<footer class="footer">
  <p>{@html m.footer()}</p>
</footer>

<style>
  .footer {
    background-color: var(--color-primary-bg);
    text-align: center;
    padding: 2rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-secondary);
  }
</style>
