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

**Runtime target**: this app runs as a Cloudflare Worker, not Node. Server code accesses Cloudflare bindings via `import { env, waitUntil } from "cloudflare:workers"` (adapter-cloudflare 8 removed `event.platform`; `cf` is on `request.cf`), not via `process.env`. There is no SvelteKit config file: all kit options live in `sveltekit({...})` in `vite.config.ts`. Bindings are declared in `wrangler.jsonc` and typed in `src/worker-configuration.d.ts` (regenerate with `pnpm gen` after changing bindings). Currently the worker only declares the static-assets binding — no KV/rate-limiter bindings are in use.

**i18n via Paraglide**: `src/lib/paraglide/` is generated output (from `project.inlang/` + `messages/*.json` sources) — do not hand-edit files in there. The vite plugin regenerates it on build/dev. Locale routing works through:

- `src/hooks.server.ts` — `paraglideMiddleware` wraps every request, sets the resolved locale and rewrites `%lang%` in the HTML shell.
- `src/hooks.ts` — `reroute` de-localizes incoming URLs (e.g. `/de/foo` → `/foo`) before SvelteKit routing runs.
- Use `m` from `#lib/paraglide/messages` for translated strings, and `getMessage(key)` in `src/lib/index.ts` when the message key is dynamic (falls back to the raw key if missing).

**Project data is generated, not hand-maintained**: `projects/en.yaml` and `projects/de.yaml` are the source of truth (id, title, description, link, tags). `vite-plugins/generate-projects.ts` (a custom vite plugin, runs on dev/build) reads both YAML files and emits `src/lib/projects/index.ts` (`projectsByLocale`, `tags`) — do not hand-edit that generated file. Tag ids become `projects.tag.<id>` Paraglide message keys. `src/lib/components/Projects.svelte` consumes `projectsByLocale[locale]` and supports client-side tag filtering.

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

None currently required — `.env.example` is empty. The site does not call any external API needing secrets. If you reintroduce server-side secrets, use `$app/env/private` (the `$env/*` modules are deprecated in SvelteKit 3) or `env` from `cloudflare:workers`.

## Conventions

- Prettier config: 2-space indent, double quotes, trailing commas, printWidth 110 (`.prettierrc`). Run `pnpm format` before committing.
- Path alias `#lib` → `src/lib`, declared as Node subpath imports in `package.json` `imports` (SvelteKit 3 dropped `$lib`). Imports need file extensions, e.g. `#lib/utils.js`, `#lib/bitfield.svelte.ts`.
- `tsconfig.json` excludes `src/lib/paraglide` (generated JS; types come from its `.d.ts` files).
