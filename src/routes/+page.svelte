<script lang="ts">
  import { Github, Linkedin, Mail, Twitter, Menu } from "@lucide/svelte";
  // import ContactForm from "$lib/components/ContactForm.svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import TechStack from "$lib/components/TechStack.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";

  // let { form } = $props();

  let isMenuOpen = $state(false);

  $effect(() => {
    if (isMenuOpen) {
      document.querySelector("dialog")?.showModal();
    } else {
      document.querySelector("dialog")?.close();
    }
  });
</script>

<div class="bg-background min-h-screen">
  <header
    class="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm"
  >
    <div>
      <div class="container mx-auto flex h-14 items-center justify-between px-4">
        <a href="/" class="font-bold">LukeZ</a>

        <!-- Desktop Navigation -->
        <nav class="flex items-center gap-6 text-sm font-medium">
          <a href="#projects" class="hover:text-foreground/80 transition-colors"> Projects </a>
          <a href="#about" class="hover:text-foreground/80 transition-colors"> About </a>
          <!-- <a href="#contact" class="hover:text-foreground/80 transition-colors"> Contact </a> -->
        </nav>

        <div class="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  </header>

  <!-- TODO: Fix Socials -->

  <main class="container mx-auto px-4 md:px-6">
    <section id="about" class="py-12 md:py-24 lg:py-32">
      <div class="container px-4 md:px-6">
        <div class="flex flex-col items-center justify-center gap-7 text-center">
          <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
            Full Stack Developer
          </h1>
          <div class="gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <button
                class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <Github class="h-4 w-4" />
                <span class="sr-only">GitHub</span>
              </button>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              <button
                class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <Linkedin class="h-4 w-4" />
                <span class="sr-only">LinkedIn</span>
              </button>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <button
                class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <Twitter class="h-4 w-4" />
                <span class="sr-only">Twitter</span>
              </button>
            </a>
            <a href="mailto:hello@example.com">
              <button
                class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <Mail class="h-4 w-4" />
                <span class="sr-only">Email</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>

    <section id="projects" class="py-12 md:py-24 lg:py-32">
      <div class="container px-4 md:px-6">
        <h2 class="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Projects</h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProjectCard
            title="E-commerce Platform"
            description="A full-stack e-commerce platform built with SvelteKit, Prisma, and Stripe integration."
            image="/placeholder.svg?height=400&width=600"
            link="https://github.com"
            tags={["SvelteKit", "Prisma", "Stripe"]}
          />
          <ProjectCard
            title="Task Management App"
            description="A real-time task management application with team collaboration features."
            image="/placeholder.svg?height=400&width=600"
            link="https://github.com"
            tags={["Svelte", "Node.js", "Socket.io"]}
          />
          <ProjectCard
            title="AI Chat Interface"
            description="An AI-powered chat interface with natural language processing capabilities."
            image="/placeholder.svg?height=400&width=600"
            link="https://github.com"
            tags={["OpenAI", "SvelteKit", "TailwindCSS"]}
          />
        </div>
      </div>
    </section>

    <section class="py-12 md:py-24 lg:py-32">
      <div class="container flex flex-col gap-5 px-4 md:px-6">
        <h2 class="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tech Stack</h2>
        <p class="text-center text-gray-500 dark:text-gray-400">
          I work with a variety of technologies to build my projects. Here are some of my favorites:
        </p>
        <TechStack />
      </div>
    </section>

    <!-- <section id="contact" class="py-12 md:py-24 lg:py-32">
      <div class="container px-4 md:px-6">
        <div class="mx-auto max-w-2xl">
          <h2 class="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Get in Touch</h2>
          <ContactForm {form} />
        </div>
      </div>
    </section> -->
  </main>

  <footer class="border-t">
    <div class="container mx-auto flex w-full shrink-0 flex-col items-center gap-2 px-4 py-6 sm:flex-row md:px-6">
      <p class="text-xs text-gray-500 dark:text-gray-400">© 2025 LukeZ</p>
    </div>
  </footer>
</div>
