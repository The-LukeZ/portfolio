# LukeZ Portfolio

Personal portfolio of LukeZ. Built with SvelteKit 5 + TypeScript, deployed to [Cloudflare Workers](https://workers.cloudflare.com/) via `adapter-cloudflare`.

## Features

- Multi-language support (en/de) via Paraglide i18n
- Dynamic project & social links showcase
- Dynamic homepage background image sourced from Unsplash (JWT-gated endpoint, rate-limited, KV-cached)
- Standalone Discord permissions calculator (`/discord-permissions`)
- Standalone business subsite with imprint (`/business`)
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
pnpm cf-typegen   # regenerate worker-configuration.d.ts from wrangler.jsonc bindings
```

Copy `.env.example` to `.env` and fill in `UNSPLASH_APP_ID`, `UNSPLASH_ACCESS_KEY`, `UNSPLASH_SECRET_KEY`, and `JWT_SECRET`.

## Deploy

```bash
pnpm deploy   # build then wrangler deploy
```

See `CLAUDE.md` for architecture details.
