<script lang="ts">
  import { enhance } from "$app/forms";

  let { form = $bindable() } = $props();

  let pending = $state(false);
  let message = $state("");

  function handleSubmit() {
    pending = true;
  }

  $effect(() => {
    if (form?.success) {
      message = "Message sent successfully!";
      pending = false;
    } else {
      message = "Error sending message. Please try again.";
      pending = false;
    }
  });
</script>

<div class="bg-card text-card-foreground rounded-lg border p-6 shadow-xs">
  <form method="POST" action="?/contact" use:enhance={handleSubmit} class="gap-4">
    <div>
      <label for="name" class="mb-2 block text-sm font-medium"> Name </label>
      <input
        id="name"
        name="name"
        required
        class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
    <div>
      <label for="email" class="mb-2 block text-sm font-medium"> Email </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
    <div>
      <label for="message" class="mb-2 block text-sm font-medium"> Message </label>
      <textarea
        id="message"
        name="message"
        required
        class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
      ></textarea>
    </div>
    <button
      type="submit"
      class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Sending..." : "Send Message"}
    </button>
    {#if message != ""}
      <p class="text-muted-foreground mt-4 text-center text-sm">{message}</p>
    {/if}
  </form>
</div>
