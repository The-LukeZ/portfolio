import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { generateProjectsPlugin } from "./vite-plugins/generate-projects.js";
import { generatePostsPlugin } from "./vite-plugins/generate-posts.js";

export default defineConfig({
  // @lucide/svelte ships Svelte components; pre-bundling them breaks their compilation.
  optimizeDeps: { exclude: ["@lucide/svelte"] },
  plugins: [
    devtoolsJson(),
    generateProjectsPlugin(),
    generatePostsPlugin(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
      strategy: ["url", "preferredLanguage", "baseLocale"],
      localStorageKey: "paraglide-lang",
      disableAsyncLocalStorage: true, // Disable async local storage for serverless environments
      cleanOutdir: true, // Clean the output directory before generating files
      emitPrettierIgnore: true, // Emit a .prettierignore file to ignore generated files
    }),
    sveltekit({
      // Consult https://svelte.dev/docs/kit/integrations
      // for more information about preprocessors
      preprocess: vitePreprocess(),
      // See https://svelte.dev/docs/kit/adapters for more information about adapters.
      // The adapter overwrites `main` of its config, so it gets its own file; dev bindings still come from wrangler.jsonc.
      adapter: adapter({
        fallback: "plaintext",
        config: "wrangler.sveltekit.jsonc",
        platformProxy: { configPath: "wrangler.jsonc", envFiles: [".env"] },
      }),
      output: {
        bundleStrategy: "single",
      },
      version: {
        name: "1",
        pollInterval: 300_000,
      },
    }),
  ],
});
