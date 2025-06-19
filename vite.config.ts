import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [
    devtoolsJson(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
      strategy: ["localStorage", "preferredLanguage", "baseLocale"],
      localStorageKey: "paraglide-lang",
      disableAsyncLocalStorage: true, // Disable async local storage for serverless environments
      cleanOutdir: true, // Clean the output directory before generating files
      emitPrettierIgnore: true, // Emit a .prettierignore file to ignore generated files
    }),
    sveltekit(),
  ],
});
