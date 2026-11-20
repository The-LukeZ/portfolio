---
title: How SupportMail Survived a Server Going From 100k to 1.3M Users
date: 2026-07-08T13:45:00+02:00
summary: When a Discord server hit a million members, most bots would have buckled. Here's how SupportMail's early architecture decisions bought enough breathing room to shard properly instead of scrambling through a major outage.
project: supportmail
image:
  src: /media/feed/019f4380-5032-70ab-bec9-fa61639b7d6f.webp
  alt: How the Bot Survived a Server Going From 100k to 1.3M Users
draft: false
updated: ''
---

A few months ago, SupportMail was added to a server with about a hundred thousand members.
That number sounds large. For a Discord modmail bot, it mostly is. But the server kept growing - fast. Within weeks it crossed a million users, and my bot was sitting in the middle of it,
trying to stay a reliable support bot. They later told be they already broke a handful of other bots before.

It didn't go down. Here's why - and what I had to build when the headroom eventually ran out.

## What SupportMail Does

SupportMail is a modmail and moderation bot. Users open support tickets by clicking a panel button in a server. The bot DMs them, collects their issue, and creates a Discord forum post that staff reply to. Every message in the DM gets relayed to the forum thread, and vice versa.  
It also handles reports, blacklists, and a ton of configuration for every guild.

The key thing to understand: this is an event-heavy bot. Every DM - every message, every button click, every forum reply is an event. At 1M members, a spike in support requests doesn't mean ten tickets.  
It means hundreds of near-simultaneous events hitting the same handlers.

## The First Warning Sign: RAM

Some days after the bot was added to that server, memory usage started climbing. Not slowly - aggressively. After I noticed the bot was down one day I restarted the bot and took a look at my logs. I noticed that it said that it ran out of memory and was killed by the OS. The whole server was restarted due to this. Within days I was restarting the bot on a daily schedule just to reclaim memory.

The culprit was almost certainly Discord.js's internal member and message caches. When your bot is in a million-member server, Discord pushes member updates, message events, and guild data at a volume the default cache configuration never anticipated.
The caches grow, stay grown, and never shed the weight.

This was the first signal that the bot was in new territory. The Discord.js caches were the culprit - not mine. The bot's own caching was already minimal by design, built that way from the start. That prior decision is what bought me time later.

## Why It Held Up

### In-flight promise deduplication

When multiple events for the same guild arrive in a burst, they all need the same data - guild config, open tickets, mutual servers. The naive approach queries the database for each one.

Instead, the bot stores in-flight `Promise` objects in its caches rather than resolved values. If a second event arrives before the first DB query finishes, both callers await the same
promise. One query serves them both. The promise is removed from the map in a `finally` block so it can't be reused after it settles.

```ts
if (cache.has(guildId)) return cache.get(guildId);
const promise = fetchFromDB(guildId).finally(() => cache.delete(guildId));
cache.set(guildId, promise);
return promise;
```

At scale, a burst of 50 events for the same guild costs one DB query, not 50. This pattern applies across prefetch data - open tickets, mutual guilds, auto-redirect settings - all with a 15-second TTL.

### Duplicate ticket creation under load

When a user sends a DM that should create a ticket, the bot does async work: checks the cache, validates, queries the database, calls the Discord API. In a burst, the same user's DM might trigger this path twice before the first run finishes.

The fix is a per-user distributed lock using Redis `SET key 1 NX EX 30`. That's atomic - it sets the key only if it doesn't exist, with a 30-second expiry that survives a process crash.
If `acquire()` returns false, the duplicate event is dropped immediately before any async work starts.

In development, the same interface is backed by an in-process cache with no external dependency. Same code paths, zero infra overhead locally.

This sounds simple. It is. But most bots don't do it. Without it, users spamming DMs triggered redundant config lookups and parallel ticket creation attempts - the bot fell behind and sent garbled or duplicate responses.

### Minimal caching by design

A lot of bots try to cache everything to avoid hitting the database. That sounds smart until you're running a million-member server and your in-memory cache is holding stale data for users
who left, guilds that changed their config, and tickets that closed two hours ago. I don't have a dedicated server with a f\*ckbyte of RAM to throw at a cache that never shrinks.

SupportMail's caching strategy is deliberately minimal. Short TTLs. Only cache what's genuinely hot. Use database indexes properly so uncached queries are fast anyway. The `awaitingResponse`
cache - which holds context between a user clicking a button and sending their first DM - uses a 10-minute TTL and nothing else. When the entry expires, the flow simply asks the user to start over.

This kept memory usage relatively predictable as the server grew. There was no runaway cache to prune. At least, it wasn't growing out of control. I still knew I had the restart the bot every day to reclaim memory.

## What It Bought Me

Days. Not hours - days.

None of the decisions in the previous section were made in response to this server. They were baked into the architecture from day one - efficiency and performance were always the goal, not afterthoughts. That's precisely why the bot had time to spare when it needed it.

When the server crossed a million users, I wasn't scrambling to stop an outage. The bot was slow in a few places, latency on some interactions went up, but it kept working.
I had time to look at metrics, identify the actual bottlenecks, and plan a proper solution rather than patching under fire. Well, the shit was burning but the fire was at least contained.

The actual bottleneck turned out to be what you'd expect: a single process running one Discord client can only handle so many guilds, even with internal sharding (d.js things). I needed to shard the bot physically.

## What I Had to Build Anyway

### Starting point: galactic.ts

I didn't write a sharding system from scratch. I started with [galactic.ts](https://github.com/tiramisulabs/galactic.ts), an existing sharding library for Bun-based Discord bots, and rewrote it using Bun's
native APIs instead of Node's `child_process`. The core approach - a manager process that spawns shard worker processes and routes IPC between them - stayed the same. What changed was parts underneath.

### The Bun fork() environment variable bug

Bun 1.3.x has a bug with `child_process.fork()`. It takes an environment snapshot at process startup and ignores the `env` option when actually calling `fork()`. This means shard identity
variables (`CLUSTER_ID`, `SHARD_LIST`) are never seen by worker processes. Workers start with no idea which shards they own.

The fix was switching to `Bun.spawn()`, which correctly passes environment variables at call time.

### Sentry doesn't work in Bun child processes either

While wiring things up I discovered that Sentry's async transport silently no-ops inside Bun child processes. `captureException` and `captureMessage` calls are queued and never flushed. Errors in shard processes were disappearing into the void.

Until a few days ago, the only workaround was to use Sentry's logging integration because the `capture` methods rely on two node V8 features called `async_hooks` and `diagnostics_channel` that Bun didn't have at the time. Diagnostics channel was only partially implemented, and Bun's `async_hooks` implementation say "AsyncLocalStorage and AsyncResource are implemented. However, v8 promise hooks required for broader compatibility are not called."

Diagnostics channel are now in the canary build, but Bun's `async_hooks` implementation is still incomplete. The only way to get Sentry working in Bun child processes is to use the logging integration, which is a shame because it doesn't capture stack traces or breadcrumbs by its own...  
The Sentry SDK has a `childProcessIntegration` that is supposed to work with node's `child_process` module, but Bun's `fork()` implementation doesn't support it yet. I tried to implement a custom integration that would relay events from the child process to the manager, but it didn't work at all.

### The real headache: routing everything to the right place

Sharding the Discord connection is the easy part. The harder part is everything that touches Discord indirectly.

SupportMail has an internal REST API (served via Hono) and a WebSocket server (Socket.io) for the dashboard for real-time communication.
Before sharding, all of this lived in the same process as the bot. The Discord client was just... there, importable, available.

After sharding, that process no longer exists. There's a manager process and N child processes. The manager runs the API and WebSocket server. The workers each hold a Discord
client covering their assigned shards. No file under the API layer can import a Discord client at all - there isn't one in scope.

Every API route or WebSocket event that needs Discord data - fetching channel info, updating forum tags, getting member details - has to go through IPC. The manager serializes the request,
routes it to the worker that owns the relevant guild's shard, waits for a response, and continues.

Routing uses the standard snowflake formula to determine which shard owns a guild: `(guild_id >> 22n) % totalShards`

From the shard ID, finding the owning cluster is a lookup. The IPC multiplexer assigns each request a UUID, stores the resolve/reject callbacks in a `Map`, and sets a 5-second timeout.
When the response arrives with the matching UUID, the callbacks fire and both maps clean up.

This is the kind of work that isn't hard in any single piece but compounds fast. A dashboard action like saving a ticket category - which needs to read and update Discord forum tags -
touches the API route, the IPC multiplexer, the shard routing table, and the worker handler, all in sequence, before a response goes back to the browser. Tracing bugs across that chain
when something goes wrong is genuinely painful with Sentry only working in the manager process.

Refactoring the API to never touch a Discord client directly - enforcing that as an architectural rule rather than just a convention - was the most tedious part of the whole
migration. But it was the right decision and the routing is reliable.

## The Takeaway

Design for efficiency first.

Sharding is the right answer for a million-user bot - but if the code had been naive about caching and deduplication, sharding wouldn't have saved it.
I'd have been sharding a bot that thundering-herded itself on every event.

The patterns that kept SupportMail alive aren't exotic:

- Deduplicate in-flight async work before it hits the database
- Use a distributed lock to stop the same work from running twice in parallel
- Only cache data that's expensive to re-fetch and changes rarely

Most of this is invisible when traffic is normal. At a million users, it's the difference between a bad week and a good story.

Fun fact: This was when I added sharding:

![How the Bot Survived a Server Going From 100k to 1.3M Users](/media/feed/019f4380-5032-70ab-bec9-fa61639b7d6f.webp)
