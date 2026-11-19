# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Fellow developers: checking out LukeZ's libraries, GitHub and Dev.to posts.
- Friends and community: people from LukeZ's Discord circles who already know him.
- Discord bot users: people who arrive via Ticketon or SupportMail and want to see who built it.

Recruiters and employers are not a primary audience.

## Product Purpose

The personal homepage of LukeZ, a 21-year-old developer from Germany (IT specialist apprentice since August 2025). It shows who he is, what he builds, and where to find him. Success: a visitor understands within seconds that this is a prolific builder of useful tools, sees the flagship projects first, and can still browse the long tail without being overwhelmed.

## Positioning

A builder of helpful tools rather than trendy apps ("ships own projects, mostly to make things suck less"). The proof is real, running products with real usage, not a skills list.

## Operating Context

- Bilingual (en/de) via Paraglide; every visible string has both locales.
- Project data lives in `projects/en.yaml` and `projects/de.yaml` and is generated into `src/lib/projects/index.ts`.
- Same layout shell (Header/Footer) is shared with `/business` (legal notice). `/discord-permissions` and `/textedit` are separate tools.

## Capabilities and Constraints

- 29 projects currently listed, across Discord bots, libraries, websites and other tools. LukeZ actively maintains roughly 50 to 70% of them.
- Flagship projects: SupportMail, Ticketon, Tomu, and possibly one or two more (undecided).
- Runs on Cloudflare Workers via SvelteKit 3 / Svelte 5. No backend data needed for the homepage.
- Undecided: whether each project should carry a maintained/archived status.

## Brand Commitments

- Name: LukeZ. Avatar at `static/LukeZ.webp`.
- Dark theme stays.
- The orange/amber accent stays.
- Voice: casual, honest, a bit cheeky (e.g. "Yes, I build a lot of stuff.").
- About text stays; the AI statement stays for now and will be rewritten by LukeZ later.

## Evidence on Hand

- Real usage figures in project descriptions: SupportMail on almost 1000 servers (incl. one with over 1M users), Ticketon on almost 100 servers.
- Social links: GitHub, YouTube, Dev.to, Discord, stats.fm, email (`src/lib/index.ts`).
- No testimonials, logos of clients or screenshots exist; do not fabricate them.

## Product Principles

1. Simple first: few sections, little chrome, fast to read.
2. Lead with the flagships; the long tail is browsable, never a wall.
3. Real facts over claims: usage numbers and running links do the persuading.
4. Both languages are first-class.
