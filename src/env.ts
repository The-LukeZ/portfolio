import { building } from "$app/env";
import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  TURNSTILE_SITE_KEY: {
    public: true,
    description:
      "Public Turnstile site key for the feed like button. A Worker secret in production, the test key in .env locally.",
    // Read at runtime from the Worker's env. Workers Builds has no .env, so the build must not require it.
    schema: (value) => {
      if (value) return value;
      if (building) return "";
      throw new Error("TURNSTILE_SITE_KEY is not set");
    },
  },
});
