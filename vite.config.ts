import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
      strategy: ["localStorage", "preferredLanguage"],
      localStorageKey: "paraglide-lang",
      disableAsyncLocalStorage: true, // Disable async local storage for serverless environments
      cleanOutdir: true, // Clean the output directory before generating files
      emitPrettierIgnore: true, // Emit a .prettierignore file to ignore generated files
    }),
    sveltekit(),
  ],
});
