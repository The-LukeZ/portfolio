---
title: Rewriting SupportMail's sharding system
date: 2026-07-25T19:00:00+02:00
summary: Replaced SupportMail's Bun-based sharding library with a Go supervisor for zero-downtime deploys and working error tracking.
project: supportmail
image: null
draft: false
updated: 2026-11-20T23:08:40+01:00
---

Note: This post is from the old blog on the homepage of SupportMail, which is removed now.

SupportMail is a Discord bot (modmail, to be specific) with so many users that it can't live in a single gateway connection anymore. Like every bot at that size, it has to shard: split its servers across multiple connections and, past a certain point, multiple processes. For a long time a standalone Node/Bun scaling library handled that, spawning and managing cluster child processes around the bot. Over the last few weeks I replaced it with a purpose-built supervisor written in Go, a rewritten cluster harness, and a proper split between the bot's REST API and the bot itself.

This post covers why the old setup wasn't ideal, what I built instead, and what's better now.

Note: the term developers use for "Discord servers" is "guild".

## What sharding actually is, and what SupportMail had before

If you're not deep in Discord bot internals, you've probably heard "sharding" without ever needing to know what it means. The rest of this post leans on it, so here's the short version.

A shard is one gateway connection to Discord, responsible for a subset of guilds. Past a certain size, one connection can't keep up with the event volume, so Discord requires you to shard once your bot crosses a guild-count threshold. Which guild belongs to which shard isn't arbitrary: it's `(guildId >> 22) % totalShards`, a deterministic hash, so any part of the system can work out which shard owns a guild without asking anyone.

That's the easy part. More shards aren't free, though: you can't open five hundred gateway connections from one process and call it done. Shards get grouped into clusters, and each cluster is a separate process holding a handful of shards. Once you have multiple processes, you need something above them that decides how many clusters to run and which shards go in which cluster, restarts a cluster that dies, and gives the outside world (an API, a dashboard) one place to ask whether guild X's shard is alive right now. That something is a supervisor.

SupportMail's old supervisor was [`galactic.ts`](https://github.com/GalaxyBotTeam/galactic.ts), a sharding manager from another bot that uses Node's child_process module. My fork of it used `Bun.spawn()` to fork cluster child processes from a `StandaloneInstance`, inside the same Bun process that also ran the bot's REST API on port 3000 and a WebSocket server on port 4000. Gateway connections, HTTP, sockets, and the supervisor logic itself all lived in one Bun process tree.

Keep that picture in mind. The next few sections (splitting structural ops from business ops, generation-based deploys) use the same idea at a smaller scale: multiple processes and one coordinator.

## Why replace it instead of patching it

The problem that started this rewrite: `Bun.spawn`, `child_process`, and worker threads used from inside the bot process broke Sentry instrumentation. The main process was still Bun, and error events published over Node's diagnostics_channel were silently lost once cluster children got involved. I couldn't trust my own error reporting.

That alone wasn't really patchable. Bun's release schedule is weird, the open PR didn't look like it would be merged soon, and the latest Bun release was over two months old with no sign of a new one. Underneath that, `galactic.ts`'s `Instance`/`Cluster` classes assume the parent process is Bun. So the choice was to patch it in place and stay Bun-native, or drop it entirely and go external in a different language. Past `galactic.ts` itself, most of what it managed wasn't hard to begin with: discord.js already supports multiple shards in one process (internal sharding), and `galactic.ts` handled the orchestration around that, not the sharding itself.

The old code still had value. The reclustering-without-downtime logic, the IPC between processes, and the cleanup I added in my fork were useful reference material for the generation/quiesce handoff I ended up building. I kept what was useful as reference and replaced the parts that didn't fit.

## Alternatives considered

Staying in-process wasn't the right call either. SupportMail isn't the only bot I run. I also have [Ticketon](https://ticketon.app), which might need the same infrastructure someday, and a manager wired into one bot's process can't be reused without another rewrite. That settled it on an external, bot-agnostic supervisor in a different language.

That left the language. I first considered Rust, mainly because I wanted an excuse to learn it better, but went with Go for two reasons:

1. The concurrency model fits the problem. "Supervise N cluster processes and fan in their IPC over a socket" is almost exactly what goroutines and channels are for. In Rust I'd have to pick an async runtime and thread `Pin` and `Send`/`Sync` bounds through everything, which is a lot of complexity for a problem Go solves in a few lines.
2. Speed of building. Go's standard library (`net`, `exec`, `net/http`) was enough to build the supervisor, the IPC hub, and the status WebSocket with almost no third-party dependencies. With Rust I'd have had to choose and learn an async runtime and pick up crates before writing any of the actual supervisor logic.

Rust isn't worse. It came down to shipping versus learning, and for infrastructure this close to being production-critical, shipping won.

## The core design decision: structural ops vs. business ops

The manager (`sm-manager`) only understands five operations: `REGISTER`, `HEARTBEAT`, `QUIESCE`, `QUIESCED`, and `DEPLOY`. They're structural: they deal with process lifecycle, not with what the bot does. Everything else that flows through the manager is an opaque string addressed by a `target`, and the manager routes it to the right cluster without ever looking inside.

Because the manager never parses a business payload, it stays bot-agnostic. It doesn't know what a "close ticket" op or a "sync guild config" op looks like; it only knows where to send them. A second bot can use the same infrastructure with its own config file, without forking the manager codebase. (This is what would let Ticketon share `sm-manager` down the line, without the manager needing to know Ticketon exists.)

The alternative was a manager that understands every op, which is basically what a monolithic supervisor looks like. That's more coupled: every new or changed bot feature that needs cross-cluster coordination means a manager code change, and in practice the manager stays one-bot-only, even if nothing stops you from bolting on a second bot in theory.

Roughly, the routing looks like this:

```plain
client → sm-manager:
  { op: "DEPLOY", ... }         → structural, manager handles directly
  { op: "guild.sync", target: clusterId, payload: <opaque> }
                                → business, manager forwards untouched to target
```

The manager checks whether `op` is one of the five structural codes. If it is, the manager acts on it. If not, it looks at the `target`, finds the owning cluster connection, and forwards the whole message.

The diagram below shows the manager, the clusters, the bot, and the API together.

![Infrastructure diagram of how everything's working together around the manager](/media/feed/019f9614-f0e5-77cb-b38a-88e15442dd11.webp "Infrastructure diagram")

A note on terms: the transport under all of this is a Unix domain socket, not TCP. Go listens with `net.Listen("unix", ...)`, and the Bun-side consumers (the API and the cluster harness) connect to the same socket path with `Bun.listen`/`Bun.connect`. I still call this "IPC" throughout. IPC means inter-process communication, and a Unix socket is one mechanism for that, in the same family as pipes or shared memory.

## Zero-downtime deploys: generations

The old deploy path used PM2, and PM2's restart (not reload) took the whole bot process down, manager included, and brought it back up. That left a real gap in gateway connections on every deploy. A plain reload has its own failure mode: for a moment, old and new code would both be attached and both handle the same events.

My fix is generation-tagged shard ranges. Each deploy starts a new "generation" of clusters holding the same shard ranges as the old generation, in parallel. The manager waits for the new generation to report ready, then flips routing over to it. Only after the flip does it tell the old generation to quiesce: stop accepting new work, finish what's in flight, then exit.

The ordering matters. Routing flips _between_ "new generation ready" and "old generation quiesced". Never before the new one is ready (its event listeners might not be loaded, the DB connection might be missing, etc.), and never long after the old one has quiesced, which would leave a gap. That way a guild's events can never route to two generations at once, or to none.

I considered simpler options, like a full restart or just accepting the old downtime (even though it was only a few seconds). At SupportMail's scale, a full-restart gap means dropped gateway events across every guild at once, which is more than a cosmetic blip. Rolling per-cluster deploys with a bounded quiesce window take more work to build, but they keep the damage small and measurable.

Deploys now roll out cluster by cluster, the quiesce gap is bounded and observable, and there's no window for duplicate event handling. In the old setup, a deploy was closer to "hope nothing important happens in that gap."

## Splitting the HTTP API out

The old `client-api` depended directly on bot internals and was attached to the manager process, so deploying the API meant touching the same process tree as the bot.

I moved it out as well. `sm-api` talks to `sm-manager` over the same Unix socket protocol as any other client, with no special access path and no shortcut through bot internals. It's just another IPC client.

So `sm-api` redeploys independently of the bot, and because it goes through the same structural/business op split, it can't drift back into depending on bot-internal shapes.

## Observability as a proof point

The structural/business split paid off in one more place. The public status page WebSocket lives on `sm-manager`, not on the bot. Heartbeat payloads get forwarded to it nearly verbatim, opaque to the manager like any other business payload.

So the split holds up outside the cases it was designed for. The manager needed no special-casing to support a public status feed, because forwarding a payload it doesn't understand was already its default behavior.

## What's better now

- Sentry instrumentation works, which was the original reason for this rewrite.
- Deploys are near-zero-downtime, with a quiesce window that's bounded and measurable instead of "however long a restart takes."
- The manager is bot-agnostic: a second bot is a config addition, not a manager fork.
- The API is fully decoupled from the bot process, with no shared process tree and no dependency on internal shapes.
- It's in production: SupportMail has been running on this since the cutover. Not the headline, but memory usage dropped roughly 40% after the switch.
- Both the manager and the API are systemd services now instead of PM2-managed, so they come back automatically after a host restart without a process manager babysitting them.

## Closing

A few things are still deferred on purpose. The transport is a Unix socket, not TCP or WebSocket. That's fine while everything runs on one host, but it's a constraint if that ever changes. The manager also has no high-availability story yet: it's a single process, and if it dies, systemd restarts it. There's no hot standby taking over. Neither is a problem today, and neither needed solving on day one just because it's a theoretical gap. It was genuinely hard for me to find the line between "but what if" and "is it really needed now".

`sm-manager` may become open source at some point, since it's bot-agnostic and not SupportMail-specific. I can't give a date. When it happens, I'll update this post and write a separate new one.

Have a good day, and if you're a Discord bot developer, I hope this post gives you some new ideas about sharding and process orchestration.

PS: Huge thanks to galactic.ts for saving my ass during the incident I talked about in the previous post. It was a game changer, and it's one of the best sharding solutions for most people.
