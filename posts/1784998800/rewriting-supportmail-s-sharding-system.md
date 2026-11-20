---
title: Rewriting SupportMail's sharding system
date: 2026-07-25T19:00:00+02:00
summary: Replaced SupportMail's Bun-based sharding library with a Go supervisor for zero-downtime deploys and working error tracking.
project: supportmail
image: null
draft: false
updated: ''
---

SupportMail is a Discord bot - modmail to be specific - managing so many users that it can't live in a single gateway connection anymore. Like every bot at that size, it has to shard: split its servers across multiple connections and, past a certain point, multiple processes. For a long time that machinery was a standalone Node/Bun scaling library, spawning and managing cluster child processes around the bot. Over the last few weeks I replaced it with a purpose-built supervisor written in Go, a rewritten cluster harness, and a proper split between the bot's REST API and the bot itself.

This post is about that rewrite: why the old setup wasn't ideal, what I built instead, and what's actually better now.

Note: the term developers use for "Discord servers" is "guild".

## What sharding actually is, and what SupportMail had before

If you're not deep in Discord bot internals, "sharding" is a word you've probably heard without ever needing to know what it means. Worth explaining, since the rest of this post leans on it.

A shard is one gateway connection to Discord, responsible for a subset of guilds. Discord doesn't let you put every guild your bot is in on a single WebSocket connection - past a certain size, one connection can't keep up with the event volume, and Discord enforces this by requiring you to shard once your bot crosses a guild-count threshold. Which guild belongs to which shard isn't arbitrary: it's `(guildId >> 22) % totalShards`, a deterministic hash so any part of the system can figure out, without asking anyone, which shard owns a given guild.

That's the easy part. The harder part is that "more shards" isn't free - you can't just open five hundred gateway connections from one process and call it done. Shards get grouped into clusters, where each cluster is a separate process holding a handful of shards. And the moment you have multiple processes, you need something above them deciding how many clusters to run, which shards go in which cluster, restarting a cluster that dies, and giving the outside world (an API, a dashboard) a single place to ask "is guild X's shard even alive right now." That something is a supervisor.

SupportMail's old supervisor was [`galactic.ts`](https://github.com/GalaxyBotTeam/galactic.ts), a sharding manager from another bot, using node's child_process module. My fork of it used `Bun.spawn()` to fork cluster child processes from a `StandaloneInstance`, all living inside the same Bun process that also ran the bot's REST API on port 3000 and a WebSocket server on port 4000. Everything - gateway connections, HTTP, sockets, the supervisor logic itself - was one Bun process tree.

If "why shard" didn't land, the next few sections won't either - splitting structural ops from business ops, generation-based deploys, same idea. Still just multiple processes and one coordinator, only smaller.

## Why replace it instead of patching it

The concrete pain that started this whole rewrite: `Bun.spawn`, `child_process`, and worker threads used from inside the bot process broke Sentry instrumentation. The main process was still Bun. Errors events published over node's diagnostics_channel simply didn't work and were silently lost the moment cluster children got involved. This was a "I can't trust my own error reporting" bug.

That alone was not really patchable since Bun's release schedule is weird and the open PR didn't seem to be merged soon - the latest Bun release was also over two months ago and there were no signs of a new release. What made it not worth patching was what sat underneath it: `galactic.ts`'s `Instance`/`Cluster` classes are coupled to the assumption that the parent process is Bun. The choice was patch it in place and stay Bun-native, or drop it entirely and go external in a different language. Nothing in between. And once you look past `galactic.ts` itself, most of what it managed wasn't hard to begin with: discord.js already supports multiple shards in one process natively (internal sharding) — `galactic.ts` handled orchestration around that, not the sharding itself.

To be fair to the old code - the reclustering-without-downtime logic, the IPC communication between processes and the cleanup I added in my fork weren't dead weight. They were useful reference material for the generation/quiesce handoff I ended up building - parts worth keeping got kept as reference, parts that were structurally unsuitable got replaced.

## Alternatives considered

The section above covers why patching `galactic.ts` in place was off the table. Even setting that aside, staying in-process wasn't the right call: SupportMail isn't the only bot I run - I also have [Ticketon](https://ticketon.app), which might need the same infrastructure someday - and a manager wired into one bot's process can't be reused without another rewrite. That's what settled it on an external, bot-agnostic supervisor in a different language.

Speaking of language, this was still open. I initially considered Rust, mainly because I wanted an excuse to learn it more. However I went with Go instead, for two reasons:

1. **The concurrency model fits the problem shape directly.** "Supervise N cluster processes and fan-in their IPC over a socket" is almost exactly what goroutines and channels are for. Rust's async story - picking a runtime, `Pin`, `Send`/`Sync` bounds threading through everything which introduces complexity to solve a problem that Go solves with a few lines of code.
2. **Speed of building.** Go's standard library (`net`, `exec`, `net/http`) was enough to build the supervisor, the IPC hub and the status WebSocket with almost no third-party dependencies. Rust would've meant choosing and learning an async runtime and picking up crates before writing any of the actual supervisor logic.

This doesn't mean Rust is worse. It's a "shipping-goal vs learning-goal" calculation, and for infrastructure this close to being production-critical, shipping won.

## The core design decision: structural ops vs. business ops

This is the core routing design.

The manager (`sm-manager`) only understands five operations: `REGISTER`, `HEARTBEAT`, `QUIESCE`, `QUIESCED`, and `DEPLOY`. These are structural - they're about process lifecycle, not about what the bot does. Everything else that flows through the manager is an opaque string, addressed by a `target`, that the manager routes to the right cluster without ever looking inside it.

Why this matters: the manager never parses a business payload. It doesn't know what a "close ticket" op looks like, or a "sync guild config" op, or anything else the bot cares about - it just knows where to send it. That means the manager stays completely bot-agnostic. Having a second bot use the same infrastructure, just by using a different config file means we don't have to fork the manager codebase. (Concretely, this is the thing that would let Ticketon share `sm-manager` down the line, without the manager needing to know Ticketon exists.)

The alternative - a manager that understands every op - was on the table implicitly, since that's basically what a monolithic supervisor looks like. It's more coupled: every new bot feature/feature change that needs cross-cluster coordination means a manager code change, and the manager is permanently one-bot-only in practice even if nothing stops you from bolting on a second bot in theory.

Roughly, the routing looks like this:

```plain
client → sm-manager:
  { op: "DEPLOY", ... }         → structural, manager handles directly
  { op: "guild.sync", target: clusterId, payload: <opaque> }
                                → business, manager forwards untouched to target
```

The manager branches on whether `op` is one of the five structural codes. If yes, it acts. If no, it looks at the `target`, finds the owning cluster connection, and forwards the whole message payload.

The topology diagram below shows everything in context, including the manager, the clusters, the bot, and the API.

![Infrastructure diagram of how everything's working together around the manager](019f9614-f0e5-77cb-b38a-88e15442dd11.png "Infrastructure diagram")

One terminology note: the transport under all of this is a Unix domain socket, not TCP. Go listens with `net.Listen("unix", ...)`; the Bun-side consumers (the API and the cluster harness) connect to the same socket path with `Bun.listen`/`Bun.connect`. I still call this "IPC" throughout - IPC means inter-process communication, and a Unix socket is one mechanism for that, in the same family as pipes or shared memory.

## Zero-downtime deploys: generations

The old deploy path used PM2, and PM2's restart (not reload) meant the whole bot process - manager included - went down and came back up. That's a real "gap" in gateway connections on every deploy. The naive fix, a plain reload instead of a restart, has its own failure mode: for a moment you'd have old and new code both attached and both handling the same events, i.e. duplicate event handling.

The fix I came up with is generation-tagged shard ranges. Each deploy spins up a new "generation" of clusters holding the same shard ranges as the old generation, in parallel. The manager waits for the new generation to report ready before it flips routing over to it. Only after the flip happens does it tell the old generation to quiesce - stop accepting new work, finish in flight, then exit.

The ordering is the whole point: routing flips _between_ "new generation ready" and "old generation quiesced", never before the new one's ready (the event listeners might not be loaded, DB connection might be missing, etc.) and never long after the old one's quiesced (you'd have a gap). That ordering guarantees there's no window where a guild's events could route to two generations at once, and no window where they route to none.

I considered simpler options - a full restart, or just accepting the old downtime (even though it was just a few seconds) - and rejected them because at SupportMail's scale, a full-restart gap means dropped gateway events across every guild simultaneously, not a cosmetic blip. Rolling per-cluster deploys with a bounded quiesce window costs more implementation complexity but limits the actual "damage" to something measurable and small.

What's better now: deploys roll out cluster-by-cluster instead of all-at-once, the quiesce gap is bounded and observable instead of open-ended, and there's no duplicate-event-handling window to worry about - versus the old world, where a deploy was closer to "hope nothing important happens in that gap."

## Splitting the HTTP API out

The old `client-api` depended directly on bot internals and lived attached to the manager process - deploying the API meant touching the same process tree as the bot.

I decided to outsource it as well - `sm-api` fixes that by talking to `sm-manager` over the exact same Unix socket protocol any other client uses - there's no special access path, no shortcut through bot internals. It's just another IPC client.

The payoff is that `sm-api` redeploys independently of the bot. And because it goes through the same structural/business op split described above, it never ends up back in a position where it depends on bot-internal shapes. But the fact that it's decoupled from the bot process is also a benefit.

## Observability as a proof point

One more place the structural/business split paid off in practice: the public statuspage WebSocket lives on `sm-manager`, not on the bot. Heartbeat payloads get forwarded to it essentially verbatim, opaque to the manager the same way any other business payload is.

This confirms the split holds up outside the cases it was designed for - the manager didn't need special-casing to support a public status feed, because "forward an opaque payload without understanding it" was already the default behavior.

## What's better now

- Sentry instrumentation works - the original reason this rewrite started.
- Deploys are near-zero-downtime, with a quiesce window that's bounded and measurable instead of "however long a restart takes."
- The manager is bot-agnostic: a second bot is a config addition, not a manager fork.
- The API is fully decoupled from the bot process - no shared process tree, no internal-shape dependency.
- It's in production - SupportMail's been running on this since the cutover. Not the headline, but memory usage dropped roughly 40% after the switch.
- Both the manager and the API are systemd services now instead of pm2-managed, so they come back automatically on a host restart without needing a process manager babysitting them.

## Closing

A few things are deliberately still deferred. The transport is a Unix socket, not TCP or WebSocket, which is fine for now since everything runs on one host - but it's a constraint if that ever changes. The manager also has no high-availability story yet; it's a single process, and if it dies, it's systemd restarting it, not a hot standby taking over. Neither of these is a problem today, and neither needed solving on day one just because it's theoretically a gap. It was genuinely hard for me to find the line beteen "but what if" and "is it really needed now".

`sm-manager` may end up open-source at some point, since it's bot-agnostic and not SupportMail-specific. I can't give a date - I will update this post and make a separate new post when that happens.

Have good day, and if you're a Discord bot developer, I hope this post helps you think about sharding and process orchestration in a new way.

PS: Huge thanks for galactic.ts also for saving my ass during the incident I talked about in the previous post. It was a game changer and is one of the best sharding solutions for most people.
