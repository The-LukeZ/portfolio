# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio of LukeZ. SvelteKit 3 (Svelte 5) + TypeScript 6, deployed to Cloudflare Workers (via `adapter-cloudflare`). Uses Paraglide for i18n (en/de), pnpm as package manager.

## Commands

- `pnpm dev` — start dev server (vite dev)
- `pnpm build` — production build
- `pnpm preview` — build then run via `wrangler dev` (simulates Cloudflare Workers runtime)
- `pnpm deploy` — build then `wrangler deploy` (deploys to production — confirm with user before running)
- `pnpm check` — sync SvelteKit types + run `svelte-check` (type checking)
- `pnpm check:watch` — same, in watch mode
- `pnpm format` — apply prettier formatting
- `pnpm lint` — check formatting only (prettier --check), no separate ESLint config
- `pnpm gen` — regenerate `src/worker-configuration.d.ts` from `wrangler.jsonc` bindings

No test suite exists in this repo.

**In WSL: Tell the user to run pnpm commands in their Windows terminal, not in WSL.**

## Architecture

**Runtime target**: this app runs as a Cloudflare Worker, not Node. Server code accesses Cloudflare bindings via `import { env, waitUntil } from "cloudflare:workers"` (adapter-cloudflare 8 removed `event.platform`; `cf` is on `request.cf`), not via `process.env`. There is no SvelteKit config file: all kit options live in `sveltekit({...})` in `vite.config.ts`. Bindings are declared in `wrangler.jsonc` and typed in `src/worker-configuration.d.ts` (regenerate with `pnpm gen` after changing bindings). The deployed entry is `src/worker.ts` (`main` in `wrangler.jsonc`): it re-exports the SvelteKit handler (imported as `sveltekit-worker`, an alias for `.svelte-kit/cloudflare/_worker.js`) and adds a `scheduled` handler. The adapter writes its handler to the `main` of `wrangler.sveltekit.jsonc` (its own config, see `vite.config.ts`); never point the adapter at `wrangler.jsonc`, or it overwrites `src/worker.ts`. Bindings: `ASSETS`, D1 `FEED_DB` (database `portfolio-feed`, schema in `migrations/`).

**Discord announcements**: a cron trigger (`*/5 * * * *`) runs `runScheduled` in `src/lib/server/feed/announce.ts`. It posts each newly published feed post once to `DISCORD_WEBHOOK_URL`, tracking state per slug in `FEED_DB.announcements` (`sent`, `skipped`, `pending`, `given_up`). Posts older than 24 h are marked `skipped`, failures are retried and given up after 5 attempts. Test locally: `pnpm wrangler d1 migrations apply portfolio-feed --local`, put a test webhook in `.env`, `pnpm build && pnpm wrangler dev --test-scheduled`, then `curl "http://localhost:8787/__scheduled?cron=*/5+*+*+*+*"`.

**i18n via Paraglide**: `src/lib/paraglide/` is generated output (from `project.inlang/` + `messages/*.json` sources) — do not hand-edit files in there. The vite plugin regenerates it on build/dev. Locale routing works through:

- `src/hooks.server.ts` — `paraglideMiddleware` wraps every request, sets the resolved locale and rewrites `%lang%` in the HTML shell.
- `src/hooks.ts` — `reroute` de-localizes incoming URLs (e.g. `/de/foo` → `/foo`) before SvelteKit routing runs.
- Use `m` from `#lib/paraglide/messages` for translated strings, and `getMessage(key)` in `src/lib/index.ts` when the message key is dynamic (falls back to the raw key if missing).

**Project data is generated, not hand-maintained**: `projects/en.yaml` and `projects/de.yaml` are the source of truth (id, title, description, link, tags). `vite-plugins/generate-projects.ts` (a custom vite plugin, runs on dev/build) reads both YAML files and emits `src/lib/projects/index.ts` (`projectsByLocale`, `tags`) — do not hand-edit that generated file. Tag ids become `projects.tag.<id>` Paraglide message keys. `src/lib/components/Projects.svelte` consumes `projectsByLocale[locale]` and supports client-side tag filtering.

**Feed posts are generated too**: posts live in `posts/<unix-ts>/<title-slug>.md` (frontmatter + Markdown, cover images in `static/media/feed/`). The slug and URL (`/feed/<unix-ts>/<title-slug>`) come from the path, which the CMS generates once from the publish date and title; `updated` is stamped by the CMS on every save and only shown when later than the publish date. `vite-plugins/generate-posts.ts` validates them (invalid posts fail the build), renders Markdown at build time with `satteri` + `shiki` (`vite-plugins/posts/`) and emits the gitignored, server-only `src/lib/server/feed/generated/posts.ts` (drafts dropped). Do not hand-edit it. `satteri` is a native module: only `vite-plugins/**` may import it. Runtime code reads posts via `src/lib/server/feed/index.ts` (`publishedPosts`, `publishedPost`), which applies the published rule (date not in the future) per request.

**Feed CMS** (`/admin`): Sveltia CMS, vendored as `static/admin/sveltia-cms.js` (version in `scripts/sveltia.json`; `pnpm dev`/`pnpm build` warn when outdated, update with `pnpm sveltia:update`, then test `/admin` locally). The config lives in `static/admin/init.js` (manual init); project options come from the prerendered `src/routes/admin/projects.json`. Sign-in is GitHub OAuth via `src/routes/api/cms/auth` and `src/routes/api/cms/callback` (`src/lib/server/cms-auth.ts`, secrets `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`). Saving commits to `main`, and Workers Builds deploys it. Local OAuth tests need `pnpm wrangler dev --local-upstream localhost:8787` (otherwise the route pattern makes the callback URL point at thelukez.com) and an OAuth app with callback `http://localhost:8787/api/cms/callback`. In `pnpm dev`, open `/admin/index.html` and use "Work with Local Repository".

**Social links**: `socialLinks` lives in `src/lib/index.ts` (hand-maintained, not generated) and drives `src/lib/components/Social.svelte`.

**Discord permissions calculator** (`src/routes/discord-permissions/`): a standalone tool independent of the main portfolio content.

- `src/lib/permissions.ts` — hand-maintained mirror of `discord-api-types`' `PermissionFlagsBits` (BigInt bitflags), plus grouped accessors (`GetGeneralPermissionsArray`, `GetTextPermissionsArray`, `GetVoicePermissionsArray`) with human-readable label overrides for UI display.
- `src/lib/bitfield.svelte.ts` — `SvelteBitfield`, a reactive (`$state`-backed) bitfield class used to track selected permissions in the UI.
- Permission bit values are BigInts; avoid coercing to `Number` (documented in the file — precision loss risk on values above 2^53).

**Business subsite** (`src/routes/business/`): separate landing/legal-notice page, distinct from the main personal portfolio route tree. Uses `src/lib/components/business/BusinessHero.svelte` and `src/lib/components/business/LegalNotice.svelte` (shares `Header.svelte`/`Footer.svelte` with the main site).

**Misc routes**:

- `src/routes/[...slug]/+server.ts` — catch-all that 301-redirects any unmatched path to `/`.
- `static/.well-known/` — static domain-verification files (`discord`, `microsoft-identity-association.json`), served as plain assets. Content types are set in `_headers` at the project root (adapter-cloudflare rejects it inside `static/`; extensionless `discord` file would otherwise get a default type).
- `src/routes/textedit/` — standalone page, unrelated to the rest of the site.

## Environment variables

Worker secrets (required, see `secrets.required` in `wrangler.jsonc`; local values in `.env` (read by `wrangler dev` and, via `platformProxy`, by `pnpm dev`), template `.env.example`): `DISCORD_WEBHOOK_URL` (feed announcements), `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (Sveltia CMS OAuth). Read them via `env` from `cloudflare:workers` or the `env` passed to handlers, never commit them.

## Conventions

- Prettier config: 2-space indent, double quotes, trailing commas, printWidth 110 (`.prettierrc`). Run `pnpm format` before committing.
- Path alias `#lib` → `src/lib`, declared as Node subpath imports in `package.json` `imports` (SvelteKit 3 dropped `$lib`). Imports need file extensions, e.g. `#lib/utils.js`, `#lib/bitfield.svelte.ts`.
- Icons from `@lucide/svelte`: always import each icon by its own path, e.g. `import ArrowRight from "@lucide/svelte/icons/arrow-right";`. Never use the package barrel (`import { ArrowRight } from "@lucide/svelte"`): it loads `aliases.js`, which ad blockers block, and the page then fails with a 500 in dev. The package stays in `optimizeDeps.exclude` in `vite.config.ts`.
- Route types are generated automatically: never write `import type { ... } from "./$types"` or annotate `load`, `GET`, `$props()` with `PageProps`/`PageServerLoad`/`RequestHandler` by hand.
- `prerender = true` is set once in `src/routes/+layout.ts`; pages only export `prerender = false` to opt out. Exception: a `+server.ts` endpoint that no page links to is never found by the crawler, so it needs its own `export const prerender = true` (e.g. `src/routes/admin/projects.json`).
- `tsconfig.json` excludes `src/lib/paraglide` (generated JS; types come from its `.d.ts` files).
