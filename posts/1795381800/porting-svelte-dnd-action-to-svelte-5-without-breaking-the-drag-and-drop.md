---
title: Porting svelte-dnd-action to Svelte 5 without breaking the drag and drop
date: 2026-11-22T22:10:00+01:00
summary: Why @lukez/svelte-dnd is a hard fork of svelte-dnd-action, how it was ported in six stages with the tests green at every step, and what changed in the API.
project: svelte-dnd
image: null
draft: false
updated: ''
---

`svelte-dnd-action` by Isaac Hagoel has been the drag and drop library for Svelte since 2020. It handles pointer, touch and keyboard drags, screen reader announcements, auto-scrolling, nested zones, drag handles, flip animations, and since 0.9.80 even zones in same-origin iframes and popups. A lot of hard-won edge-case handling lives in that code.

`@lukez/svelte-dnd` is a hard fork of `svelte-dnd-action` 0.9.80, rebuilt for Svelte 5. This post covers why the fork exists, how it was ported without losing that edge-case handling, and what the API looks like now.

## Credit first

The drag and drop engine in `@lukez/svelte-dnd` is Isaac Hagoel's work. The fork keeps the full git history, and the `LICENSE` keeps his MIT copyright line (`Copyright (c) 2020 Isaac Hagoel`) above the new one. If you are happy on `svelte-dnd-action`, there is no reason to switch: it still works with Svelte 5 and is maintained.

The port itself I couldn't have done without Claude. Claude Code did almost all of the implementation work. I had to be there the whole time to guide the agents and make the decisions, but the code changes were theirs.

## Why a fork

Upstream puts API stability first. That is a good call for a library with many users on Svelte 3 and 4, but it means the public surface stays what it was in the Svelte 3 era:

- a `use:dndzone` action,
- `consider` and `finalize` as DOM `CustomEvent`s, read through `e.detail`,
- six global setter functions (`setAriaStrings`, `setDebugMode`, `overrideItemIdKeyNameBeforeInitialisingDndZones`, ...),
- hand-written type declarations next to JavaScript source.

Svelte 5 has attachments (`{@attach}`) and callback props, and the rest of a Svelte 5 codebase looks like that. Changing upstream to match would break every existing user, which is what upstream avoids.

Semver would allow a new major next to a maintained old one, but that is a lot of work for one maintainer, so I get why Isaac hasn't done it.

Most sites still on Svelte 3 or 4 stay there because their owners are too stubborn to migrate, if you ask me. If you just want to keep a website working on old software, that's fine, and I like people who keep older things supported. But the number of people who want a more modern version of this library keeps growing.

The old API does still work on Svelte 5, especially with `fromAction`, which turns an action into an attachment. My guess is that actions won't be around forever, though. If Svelte announces that they are going away, I would rather already have a native implementation than scramble through the code at the last minute to write one, if anyone writes one at all.

So the fork takes the other trade: a full breaking rewrite of the public API, published under a new name, with no compatibility layer for `svelte-dnd-action` or Svelte 3/4.

The goals, from the migration plan:

- Svelte 5 native API: attachments plus callback props
- TypeScript source, with generated types
- A pnpm monorepo with the library and its docs site
- Modern tooling: tsdown, Vitest browser mode, a fast linter, changesets, CI
- Keep the drag and drop behavior exactly as it was

The last goal mattered most. The rest was plumbing.

## Why a staged port

A rewrite from scratch would have thrown away the safety net: most existing specs test internals (`listUtil`, `styler`, `util`), so they would not survive a redesign, and new tests only cover what their author thought of. So the port went in stages, with every test green at the end of each one. That costs some throwaway work (stage 3 carefully types code that stage 4 then changes or even removes), but every risky step has the old test suite behind it.

## Stage 1: tooling, with the JavaScript untouched

The first stage changed everything around the library and nothing inside it:

- Yarn 1 became a pnpm workspace, with the library at `packages/svelte-dnd` (moved with pure `git mv` commits, so history follows)
- Rollup 2 and Babel became tsdown, producing ESM and CJS
- ESLint 7 became oxlint, Prettier 2 became Prettier 3, husky 4 became husky 9 with lint-staged
- GitHub Actions CI was added: lint, format check, build, `publint` and `attw` (`@arethetypeswrong/cli`, which catches broken dual ESM/CJS types)
- changesets was set up in pre mode with the `next` tag

I picked these mostly because I use them in my other projects and like working with them, though there were a few technical reasons too.

Cypress, the upstream test runner, kept running the whole time. A regression found later must never come from the tooling swap.

One rule from upstream got special care: a lint rule that forbids `window`, `document`, `setTimeout` and similar globals in `src/`. It exists because zones can live in other windows, so the code must always use the globals of the node's own document. ESLint's `no-restricted-globals` was carried over to oxlint unchanged.

## Stage 2: Cypress to Vitest browser mode

Stage 2 moved all 15 Cypress specs (150 tests) to Vitest browser mode on Playwright, running Chromium, Firefox and WebKit.

The rule was: same scenarios, same assertions, same synthetic events. Only the harness changes. Cypress uses Chai assertions, and Vitest's `expect` supports the Chai API, so assertions were copied verbatim instead of being rewritten in Jest style. The translations were mechanical:

| Cypress | Vitest |
| --- | --- |
| `cy.then(() => { ... })` chains | sequential code in an `async` test |
| `cy.window().should(() => { ... })` | `await vi.waitFor(() => { ... }, { timeout: 4000 })` |
| `cy.stub(obj, "m").callsFake(fn)` | `vi.spyOn(obj, "m").mockImplementation(fn)` |

Specs were ported one per commit, with Cypress and Vitest both running in CI until the last spec moved, so no commit was red. Before Cypress was removed, a script listed every `describe > it` title from the old specs next to its Vitest result per browser, and compared the `expect(` count per file. Every original title had to be present.

Switching to `userEvent`, fake timers, or a more idiomatic style was explicitly rejected for this stage. It would have changed what the tests exercise, and the point was to keep them testing the same thing.

### Other-window tests that finally run

Upstream 0.9.80 added zones in same-origin iframes and popups. The Cypress harness for this opened real popups, but CI ran Cypress on Electron, which blocks `window.open`, so the popup tests always skipped themselves in CI.

Under Vitest, each test file already runs inside an iframe of the runner's page. The `createFrame` helper builds a frame nested inside that, which keeps the parent/child relationship the specs rely on. The other-window spec was ported first as a spike, to confirm on all three browsers that popups open from the test iframe and that the timing still holds. It did, and from then on the iframe and popup tests ran for real.

They found a bug on the first run. In Firefox, a keyboard-enabled zone in a document written with `document.write()` and `document.close()` never got its screen reader instructions. `initAria` set them up right away only when `readyState === "complete"`, and otherwise waited for `DOMContentLoaded`. After `document.close()`, Chromium and WebKit report `"complete"`, but Firefox reports `"interactive"`, and `DOMContentLoaded` has already fired by then. So the listener never ran.

Stage 2 did not fix it, because stage 2 was not allowed to touch `src/`. The failing tests were marked `it.fails` on Firefox only (so they would alert once fixed), and the bug became issue #2. The fix was small: set up immediately whenever `readyState !== "loading"`.

## Stage 3: TypeScript, one file per commit

Stage 3 converted `src/` and the tests to TypeScript, strict mode, with `isolatedDeclarations` so tsdown could generate `.d.mts` and `.d.cts` declarations. The hand-written `typings/index.d.ts` was deleted.

Files were converted leaves first (`constants`, `helpers/util`, ...), entry points last, with `allowJs` so `.ts` and `.js` could coexist and every commit stayed green. The rule for each file: types only. Where strict mode wanted a null check the code never did, the conversion used a non-null assertion with a comment, not a runtime guard. If the value really could be `null`, that was a bug, and it got an issue and a `TODO(#n)` instead of a quiet fix.

Two such issues came out of it:

- **#4:** `findWouldBeIndex` caches the shadow element's rect per zone and index. The cache outlives the shadow element moving to another zone, so the function can return `{ index: undefined }` even though its type says `number`.
- **#5:** the pointer drag handlers destructure `dzToConfig.get(e.currentTarget)`, which is `undefined` when a zone nested inside the dragged item is destroyed mid-drag. An upstream issue (isaacHagoel/svelte-dnd-action#450) reports a similar crash, closed without a reproduction.

Both were fixed after stage 3, each on its own `fix/` branch with a regression test, before the API rewrite started.

The declaration diff was useful on its own. It showed that the hand-written typings had drifted from the runtime: for example, `FEATURE_FLAG_NAMES.USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT` was typed as the string `"FEATURE_FLAG_NAMES.USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT"`, while the runtime value is `"USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT"`. Generated types end that class of bug.

## Stage 4: the Svelte 5 API

This is the breaking change. A zone used to look like this:

```svelte
<script>
    import { dndzone } from "svelte-dnd-action";

    let items = [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
    ];

    function handle(e) {
        items = e.detail.items;
    }
</script>

<ul use:dndzone={{ items, flipDurationMs: 200 }} on:consider={handle} on:finalize={handle}>
    {#each items as item (item.id)}
        <li>{item.name}</li>
    {/each}
</ul>
```

Now it looks like this:

```svelte
<script lang="ts">
    import { dndzone, type DndEvent } from "@lukez/svelte-dnd";

    type Row = { id: number; name: string };

    let items = $state<Row[]>([
        { id: 1, name: "a" },
        { id: 2, name: "b" },
    ]);

    function handle(e: DndEvent<Row>) {
        items = e.items;
    }
</script>

<ul {@attach dndzone(() => ({ items, flipDurationMs: 200, onconsider: handle, onfinalize: handle }))}>
    {#each items as item (item.id)}
        <li>{item.name}</li>
    {/each}
</ul>
```

The main changes:

- `dndzone` is an attachment factory. Options go in a getter, so the library reads them inside an effect: the zone is created once and picks up a new `items` array without being torn down mid-drag.
- `consider` and `finalize` events became `onconsider` and `onfinalize` options. `e.detail.items` is now `e.items`. The item type flows from `items` into the callbacks.
- The global setters became one call: `configure({ ariaStrings, keyboardDragTrigger, debug, idKey })`. It checks every key before applying any, and unknown keys throw.
- The one feature flag became a per-zone option, `useComputedStyleForRects`.
- Drag handles are attachments: `{@attach dragHandleZone(() => options)}` on the list and `{@attach dragHandle}` on the handle.
- `svelte` `^5.32.0` is a peer dependency (attachments need 5.29, `fromAction` needs 5.32).

### A thin layer over the old engine

Rewriting the engine around `$effect` in `.svelte.ts` files was considered and rejected. It would need the Svelte compiler in the build, touch about 1,500 lines of drag logic, and give users nothing extra. Instead, `dndzone(getOptions)` returns `fromAction(createZone, getOptions)`, where `createZone` is the old action, renamed and made internal. The engine calls the callbacks at the exact points where it used to dispatch events. The existing engine tests kept running against `createZone`, with only their event listeners swapped for callbacks.

Svelte context was considered for global config and rejected too. Attachments run in effects, where `getContext` is not available, and settings like `idKey` must agree across every zone a drag can cross, including zones in iframes and popups. A plain `configure()` call fits that.

### Drag handles and attachment order

Drag handles needed design work. Svelte runs the attachments of `{#each}` children before the zone's own attachment, so a handle usually attaches before its zone exists. Handles must still be keyboard-focusable at mount. The solution: a handle that finds no zone joins a pending set, and a new handle zone adopts every pending handle it contains.

The redesign also fixed an upstream quirk: one zone's `dragDisabled` used to leak into every other handle zone. It is now per zone. The "is a handle drag running" state stays global on purpose, because per-zone state broke keyboard drags from one handle zone into another.

### Edge cases the component tests caught

Component tests with `vitest-browser-svelte` exercised the real attachment path and caught issues the engine tests could not see. Most were in the new attachment layer:

- **#7:** with the documented shadow item hint, a zone nested inside a dragged item was dead after the drop. The zone checked the hint once at creation and became a permanent no-op, but after the drop the shadow item's `<li>` becomes the real item's `<li>`. This create-time behavior came from upstream. Now the skipped zone is set up once the hint is removed.
- A handle zone created again on the same element did not take over the handles of the zone it replaced.
- A zone created on an element during the drop animation could receive the previous zone's deferred finalize. A follow-up covered the case where the new zone has a different `type`.
- `configure` applied keys partially when a later key was invalid.

## Stage 5: docs with live demos

The only documentation after stage 4 was a 586-line README written for the old API, plus around 25 Svelte Playground links that no longer worked with the new package.

Stage 5 built `apps/docs` with SvelteKit and svelte-docsmith, prerendered and served as static files from Cloudflare Pages at [svelte-dnd.thelukez.com](https://svelte-dnd.thelukez.com). It has guides, 13 live demos that run the code they display, a migration guide, and the upstream release notes as history. svelte-docsmith is still pre-1.0, but I had worked with it before, and I like supporting smaller libraries when they fit.

The API reference is generated. A small build-time extractor reads the library's public types and TSDoc with the TypeScript compiler API, and a public option without a description fails the build. Hand-written tables were rejected because descriptions would drift from the source, which is the same problem the generated declarations solved in stage 3.

So that the docs' install command would work before 1.0, `1.0.0-next.0` was published to npm by hand under the `next` tag. A review round after stage 5 fixed three smaller bugs, among them horizontal auto-scroll comparing the page's scroll width with the client height instead of the client width.

## Stage 6: 1.0.0

Stage 6 shipped the release:

- Changesets left pre mode with a "first stable release" changeset.
- A `release.yml` workflow on `master` runs the full CI gate (lint, typecheck, build, type tests, package checks, all three browsers) and then `changesets/action`.
- Merging the Version Packages PR publishes to npm through trusted publishing (OIDC), so no npm token lives in the repo, with an SLSA provenance attestation.
- Docs deploy from `master` so the site matches the released package.

The first merge of the Version PR published nothing. The run was green, and its log said why: `changesets/action@v2` only publishes when `publish-script` is set, and the workflow had left it out on the assumption that the action would call `changeset publish` itself. One line (`publish-script: pnpm changeset publish`) fixed it, and the next run published. I could've seen that myself, but I must've missed that bit.

[`@lukez/svelte-dnd@1.0.0`](https://www.npmjs.com/package/@lukez/svelte-dnd) is on npm as `latest`, and the [GitHub release](https://github.com/The-LukeZ/svelte-dnd/releases/tag/%40lukez%2Fsvelte-dnd%401.0.0) has the changelog.

## Where it ended up

At 1.0.0:

- about 3,000 lines of strict TypeScript DOM logic, with no Svelte imports in `src/` (`svelte` is only a peer dependency),
- 24 test files with 277 tests, each run in Chromium, Firefox and WebKit,
- real iframe and popup tests on all three browsers,
- generated declarations checked by `publint`, `attw` and type-level tests in CI.

## What I would take from this

- **Port the harness before you touch the code.** Stage 2 was mostly boring, but for me it was the most valuable stage. It also found a bug just by running tests that CI had always skipped.
- **Keep each stage to one kind of change.** Tooling, then tests, then types, then API. When a test failed, there was only one place to look.
- **Do not fix bugs inside a conversion.** Every bug found during stages 2 and 3 became an issue and a `TODO`, and was fixed separately with a regression test. That kept "types only" true and made each fix visible in history.
- **Generate what can drift.** Declarations from source, API reference from TSDoc, demos that display the code they run.
- **Steer AI.** You have to steer the AI from your cuck chair because otherwise the result is garbage.

If you use `svelte-dnd-action` on Svelte 5 and want attachments and callbacks, the [migration guide](https://svelte-dnd.thelukez.com/docs/migrating) covers every change. If you are happy where you are, stay: the engine underneath is the same one Isaac Hagoel built, and it is a good one.
