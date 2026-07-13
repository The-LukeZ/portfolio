# LukeZ Portfolio

Personal portfolio of LukeZ. Built with SvelteKit 5 + TypeScript, deployed to [Cloudflare Workers](https://workers.cloudflare.com/) via `adapter-cloudflare`.

## Features

- Multi-language support (en/de) via Paraglide i18n
- Project & social links showcase, project data generated from `projects/*.yaml`
- Standalone Discord permissions calculator ([`/discord-permissions`](https://thelukez.com/discord-permissions))
- Standalone business subsite with legal notice ([`/business`](https://thelukez.com/business))
- SEO-friendly meta tags

## Getting Started

Package manager: pnpm.

```bash
pnpm install
pnpm dev          # start dev server
pnpm build        # production build
pnpm preview      # build then run via wrangler dev (simulates Workers runtime)
pnpm check        # type-check (svelte-check)
pnpm format       # apply prettier formatting
pnpm lint         # check formatting only
pnpm gen   # regenerate worker-configuration.d.ts from wrangler.jsonc bindings
```

## Deploy

```bash
pnpm deploy   # build then wrangler deploy
```

See `CLAUDE.md` for architecture details.
