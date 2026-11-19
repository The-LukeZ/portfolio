import sveltekit from "sveltekit-worker";
import { runScheduled } from "./lib/server/feed/announce.ts";

export default {
  fetch: sveltekit.fetch,
  scheduled(controller, env, ctx) {
    ctx.waitUntil(runScheduled(env, controller.scheduledTime));
  },
} satisfies ExportedHandler<Env>;
