---
title: How SupportMail Survived a Server Going From 100k to 1.3M Users
date: 2026-07-08T13:45:00+02:00
summary: When a Discord server hit a million members, most bots would have buckled. Here's how SupportMail's early architecture decisions bought enough breathing room to shard properly instead of scrambling through a major outage.
project: supportmail
image:
  src: /media/feed/019f4380-5032-70ab-bec9-fa61639b7d6f.webp
  alt: How the Bot Survived a Server Going From 100k to 1.3M Users
draft: false
updated: 2026-11-20T23:08:49+01:00
---

Note: This post is from the old blog on the homepage of SupportMail, which is removed now.

A few months ago, SupportMail was added to a server with about a hundred thousand members.
That's a lot for a Discord modmail bot, but the server kept growing fast and crossed a million users within weeks. My bot sat in the middle of it,
trying to stay a reliable support bot. The server's team later told me they had already broken a handful of other bots before.

It didn't go down. Here's why, and what I had to build when the headroom eventually ran out.

## What SupportMail does

SupportMail is a modmail and moderation bot. Users open support tickets by clicking a panel button in a server. The bot DMs them, collects their issue, and creates a Discord forum post that staff reply to. Every message in the DM gets relayed to the forum thread, and vice versa.  
It also handles reports, blacklists, and a ton of configuration for every guild.

The important part: this is an event-heavy bot. Every DM message, button click, and forum reply is an event. At 1M members, a spike in support requests means
hundreds of near-simultaneous events hitting the same handlers.

## The first warning sign: RAM

Some days after the bot was added to that server, memory usage started climbing fast. One day I noticed the bot was down. I restarted it and checked the logs: it had run out of memory and the OS had killed it. The whole server was restarted because of this. Within days I was restarting the bot on a daily schedule just to reclaim memory.

The culprit was almost certainly Discord.js's internal member and message caches. When your bot is in a million-member server, Discord pushes member updates, message events, and guild data at a volume the default cache configuration never anticipated.
The caches grow, stay grown, and never shed the weight.

The bot's own caching was already minimal by design, built that way from the start. That earlier decision is what bought me time later.

## Why it held up

### In-flight promise deduplication

When multiple events for the same guild arrive in a burst, they all need the same data: guild config, open tickets, mutual servers. The naive approach queries the database for each one.

Instead, the bot stores in-flight `Promise` objects in its caches rather than resolved values. If a second event arrives before the first DB query finishes, both callers await the same
promise, and one query serves them both. The promise is removed from the map in a `finally` block so it can't be reused after it settles.

```ts
if (cache.has(guildId)) return cache.get(guildId);
const promise = fetchFromDB(guildId).finally(() => cache.delete(guildId));
cache.set(guildId, promise);
return promise;
```

At scale, a burst of 50 events for the same guild costs one DB query, not 50. The same pattern covers the other prefetch data (open tickets, mutual guilds, auto-redirect settings), all with a 15-second TTL.

### Duplicate ticket creation under load

When a user sends a DM that should create a ticket, the bot does async work: checks the cache, validates, queries the database, calls the Discord API. In a burst, the same user's DM might trigger this path twice before the first run finishes.

The fix is a per-user distributed lock using Redis `SET key 1 NX EX 30`. That's atomic: it sets the key only if it doesn't exist, with a 30-second expiry that survives a process crash.
If `acquire()` returns false, the duplicate event is dropped immediately, before any async work starts.

In development, the same interface is backed by an in-process cache with no external dependency. Same code paths, zero infra overhead locally.

It's a simple fix, and most bots don't have it. Without it, users spamming DMs triggered redundant config lookups and parallel ticket creation attempts, and the bot fell behind and sent garbled or duplicate responses.

### Minimal caching by design

A lot of bots try to cache everything to avoid hitting the database. That sounds smart until you're running a million-member server and your in-memory cache is holding stale data for users
who left, guilds that changed their config, and tickets that closed two hours ago. I don't have a dedicated server with a f\*ckbyte of RAM to throw at a cache that never shrinks.

SupportMail's caching strategy is deliberately minimal: short TTLs, only cache what's genuinely hot, and use database indexes properly so uncached queries are fast anyway. The `awaitingResponse`
cache, which holds context between a user clicking a button and sending their first DM, uses a 10-minute TTL and nothing else. When the entry expires, the flow simply asks the user to start over.

This kept the bot's own memory usage predictable as the server grew. There was no runaway cache of mine to prune. I still had to restart the bot every day to reclaim memory, though.

## What it bought me

Days of headroom.

None of the decisions in the previous section were made in response to this server. They were part of the architecture from day one, because efficiency and performance were always the goal. That's why the bot had time to spare when it needed it.

When the server crossed a million users, I wasn't scrambling to stop an outage. The bot was slow in a few places and latency on some interactions went up, but it kept working.
I had time to look at metrics, find the actual bottlenecks, and plan a proper solution instead of patching under fire. Well, the shit was burning, but at least the fire was contained.

The bottleneck turned out to be the one you'd expect: a single process running one Discord client can only handle so many guilds, even with internal sharding (d.js things). I needed to shard the bot across processes.

## What I had to build anyway

### Starting point: galactic.ts

I didn't write a sharding system from scratch. I started with [galactic.ts](https://github.com/GalaxyBotTeam/galactic.ts), an existing sharding library for Bun-based Discord bots, and rewrote it using Bun's
native APIs instead of Node's `child_process`. The core approach stayed the same: a manager process spawns shard worker processes and routes IPC between them. What changed was the layer underneath.

### The Bun fork() environment variable bug

Bun 1.3.x has a bug with `child_process.fork()`. It takes an environment snapshot at process startup and ignores the `env` option when actually calling `fork()`. So shard identity
variables (`CLUSTER_ID`, `SHARD_LIST`) never reach the worker processes, and workers start with no idea which shards they own.

The fix was switching to `Bun.spawn()`, which correctly passes environment variables at call time.

### Sentry doesn't work in Bun child processes either

While wiring things up I found out that Sentry's async transport silently no-ops inside Bun child processes. `captureException` and `captureMessage` calls are queued and never flushed, so errors in shard processes disappeared into the void.

Until a few days ago, the only workaround was Sentry's logging integration, because the `capture` methods rely on two Node APIs, `async_hooks` and `diagnostics_channel`, that Bun didn't fully have. Diagnostics channel was only partially implemented, and Bun's `async_hooks` docs say "AsyncLocalStorage and AsyncResource are implemented. However, v8 promise hooks required for broader compatibility are not called."

Diagnostics channel is now in the canary build, but Bun's `async_hooks` implementation is still incomplete. So the logging integration is still the only way to get Sentry working in Bun child processes, which is a shame, because it doesn't capture stack traces or breadcrumbs on its own.  
The Sentry SDK has a `childProcessIntegration` that is supposed to work with Node's `child_process` module, but Bun's `fork()` implementation doesn't support it yet. I tried to write a custom integration that relays events from the child process to the manager, but it didn't work at all.

### The real headache: routing everything to the right place

Sharding the Discord connection is the easy part. The harder part is everything that touches Discord indirectly.

SupportMail has an internal REST API (served via Hono) and a WebSocket server (Socket.io) for real-time communication with the dashboard.
Before sharding, all of this lived in the same process as the bot. The Discord client was just... there, importable, available.

After sharding, that process no longer exists. There's a manager process and N child processes. The manager runs the API and WebSocket server, and the workers each hold a Discord
client covering their assigned shards. No file under the API layer can import a Discord client at all, because there isn't one in scope.

Every API route or WebSocket event that needs Discord data (fetching channel info, updating forum tags, getting member details) has to go through IPC. The manager serializes the request,
routes it to the worker that owns the relevant guild's shard, waits for a response, and continues.

Routing uses the standard snowflake formula to determine which shard owns a guild: `(guild_id >> 22n) % totalShards`

From the shard ID, finding the owning cluster is a lookup. The IPC multiplexer assigns each request a UUID, stores the resolve/reject callbacks in a `Map`, and sets a 5-second timeout.
When the response with the matching UUID arrives, the callbacks fire and both maps clean up.

None of these pieces is hard on its own, but they add up fast. A dashboard action like saving a ticket category, which needs to read and update Discord forum tags,
touches the API route, the IPC multiplexer, the shard routing table, and the worker handler in sequence before a response goes back to the browser. Tracing bugs across that chain
is genuinely painful when Sentry only works in the manager process.

The most tedious part of the whole migration was refactoring the API so it never touches a Discord client directly, and enforcing that as an architectural rule instead of a convention.
It was worth it, and the routing is reliable.

## The takeaway

Design for efficiency first.

Sharding is the right answer for a million-user bot, but if the code had been naive about caching and deduplication, sharding wouldn't have saved it.
I'd have been sharding a bot that thundering-herded itself on every event.

The patterns that kept SupportMail alive aren't exotic:

- Deduplicate in-flight async work before it hits the database
- Use a distributed lock to stop the same work from running twice in parallel
- Only cache data that's expensive to re-fetch and changes rarely

Most of this is invisible when traffic is normal. At a million users, it's the difference between a bad week and a good story.

Fun fact: This was when I added sharding:

![How the Bot Survived a Server Going From 100k to 1.3M Users](/media/feed/019f4380-5032-70ab-bec9-fa61639b7d6f.webp)
