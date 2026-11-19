---
title: How I built this feed
date: 2026-11-20T00:13:00+01:00
summary: 'A small update feed for my projects, built into my SvelteKit site on Cloudflare Workers: posts live in git, a CMS writes them, a cron job announces them on Discord.'
project: portfolio
image: null
draft: true
updated: ''
---

I build a lot of stuff, but news about it was scattered across Discord servers, GitHub releases and Ko-fi. So I added a small feed to my own site. My site is the source of truth, everything else links back here.

## Posts live in git

Every post is a Markdown file in the repo, at `posts/<timestamp>/<title>.md`. No database for content. When the site builds, a small Vite plugin reads all posts, validates them (missing fields, unknown project, date without timezone: the build fails) and renders the Markdown to HTML.

For the Markdown I use [Sätteri](https://satteri.bruits.org), a Markdown processor written in Rust, plus Shiki for code highlighting:

```ts
const html = markdownToHtml(body, {
  features: { gfm: true, rawHtml: false },
  mdastPlugins: [noRawHtml, highlight],
  hastPlugins: [absoluteUrls],
}).html;
```

Raw HTML in a post gets escaped, and every link and image becomes an absolute URL, so the posts also work in RSS readers.

Since Sätteri it doesn't work in the workers runtime, it can only run during build, but that's fine.

## Writing posts

I don't want to open my editor for every post, so there's [Sveltia CMS](https://sveltiacms.app).
I picked Sveltia because I did a project with it already and kinda like it - it's also using Svelte, which is cool!

It's a Git-based CMS: no backend, no database, no extra service to run. The whole thing is a single JavaScript file I serve from my own site, and it reads and writes the Markdown files in my repo directly through the GitHub API. It started as a drop-in replacement for Decap CMS (formerly Netlify CMS), but it's faster and the UI is much nicer. It even has a local mode that works on the repo folder on my disk, so I can test it without pushing anything.

I sign in with GitHub, write the post, and saving commits it straight to the repo. The push triggers a deploy on Cloudflare Workers Builds, and a minute later the post is live.

The URL is generated from the publish date and the title, and the "updated" date is set automatically when I edit a post later.

External links are automatically detected via a svelte [attachment](https://svelte.dev/docs/svelte/@attach) and open in a new tab, so one can expect to not having to manually do this (it bothers me so hard when websites do this, on God!)

## Scheduled posts

The post pages, the RSS feed and the sitemap are rendered on request, not at build time. A post with a date in the future simply stays hidden until that date has passed, with no extra deploy.

## Discord

A cron trigger on the same Worker runs every five minutes. It checks for newly published posts and sends each one to my Discord server, exactly once. Which posts were already announced is tracked in a tiny D1 database. Editing a post later never sends it again, and if Discord is down, it retries a few times before giving up.

## Follow along

You can read the feed here, follow it via [RSS](/feed.xml), or join my Discord to get new posts there.

If you like what I build, you can support me on Ko-fi. That's what the button below is for.
