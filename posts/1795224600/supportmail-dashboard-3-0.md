---
title: SupportMail Dashboard 3.0
date: 2026-11-21T02:30:00+01:00
summary: SupportMail Dashboard 3.0 adds a news feed to the server dashboard and moves to SvelteKit 3. Deploys also no longer break pages while the new build runs.
project: supportmail
image: null
draft: false
updated: ''
---

The SupportMail dashboard is now on version 3.0. Most of the changes are internal, and one of them is a feature you can see.

## News in the dashboard

The server dashboard header has a news button now. It shows SupportMail updates, with a small dot when there's something you haven't read yet.

## SvelteKit 3

The dashboard now runs on SvelteKit 3 and adapter-node 6. I cleaned up the dependencies while I was at it, dropping packages I no longer used and updating the rest. SvelteKit 3 deprecates the `alias` config option, so the path aliases moved to the `imports` field of `package.json` as Node subpath imports (`#lib/*`, `#ui/*` and so on).

Mongoose needed one extra step. I bundle it into the server build so Sentry's build-time instrumentation can reach it. However, my shared package (`@supportmailapp/shared`) also imports Mongoose, and if this package remains external, a second copy is loaded from `node_modules`. Adding both to `ssr.noExternal` keeps it at a single instance.

## Deploys no longer break the live site

During a deploy, some dashboard pages failed until the restart went through. adapter-node empties its output directory before it builds, and the running server lazy-loads route chunks from that same `build/` folder. Any page whose chunk the server hadn't loaded yet broke for the whole build, because the file was gone.

Now the build goes into a separate folder and gets swapped in just before the restart:

```sh
rm -rf build.next build.prev
BUILD_OUT=build.next pnpm run build

if [ -d build ]; then mv build build.prev; fi
mv build.next build
sudo systemctl restart "$UNIT"
rm -rf build.prev
```

`BUILD_OUT` is my own variable, not something adapter-node reads. The Vite config passes it through as `adapter({ out: env.BUILD_OUT || "build" })`. A failed build also leaves the live `build/` alone now.

If you self-host a SvelteKit app with adapter-node and build in place, you probably have the same bug.
