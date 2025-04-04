<script>
  import { browser } from "$app/environment";
  let darkMode = false;

  function handleSwitchDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    darkMode ? document.documentElement.classList.add("dark") : document.documentElement.classList.remove("dark");
  }

  if (browser) {
    const savedTheme =
      localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    darkMode = savedTheme === "dark";
    savedTheme === "dark"
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
  }
</script>

<div class="flex gap-2">
  <button
    on:click={handleSwitchDarkMode}
    class="rounded-full p-2 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
  >
    <span class="sr-only">Toggle theme</span>
    {#if darkMode}
      🌞
    {:else}
      🌙
    {/if}
  </button>
</div>
