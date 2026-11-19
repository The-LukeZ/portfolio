<script lang="ts">
  import { m } from "#lib/paraglide/messages.js";
</script>

<footer class="footer">
  <p>{@html m.footer({ year: String(new Date().getFullYear()) })}</p>
</footer>

<style>
  .footer {
    background-color: var(--steel-0);
    text-align: center;
    padding: 1.5rem;
    border-top: 1px solid var(--steel-2);
    color: var(--ink-3);
    font-size: 0.875rem;
  }
</style>
