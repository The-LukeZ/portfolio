---
name: LukeZ
description: Every project is a labelled drawer in one dark steel parts cabinet.
colors:
  steel-0: "oklch(13.5% 0.004 250)"
  steel-1: "oklch(17% 0.005 250)"
  steel-2: "oklch(21.5% 0.006 250)"
  steel-3: "oklch(26% 0.007 250)"
  steel-edge: "oklch(33% 0.008 250)"
  steel-hi: "oklch(40% 0.008 250)"
  label: "oklch(75.053% 0.17907 58.273)"
  label-hover: "oklch(80.357% 0.16873 73.344)"
  label-ink: "oklch(22% 0.045 58)"
  ink: "oklch(94% 0.006 85)"
  ink-2: "oklch(76% 0.008 250)"
  ink-3: "oklch(64% 0.008 250)"
typography:
  display:
    fontFamily: "Archivo Variable, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(3rem, 8vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 72"
  headline:
    fontFamily: "Archivo Variable, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.75rem, 2.6vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 72"
  title:
    fontFamily: "Archivo Variable, Segoe UI, Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 75"
  label-strip:
    fontFamily: "Archivo Variable, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.03em"
    fontVariation: "'wdth' 78"
  plate:
    fontFamily: "Archivo Variable, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 80"
  body:
    fontFamily: "Archivo Variable, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-lead:
    fontFamily: "Archivo Variable, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  stamp:
    fontFamily: "JetBrains Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    fontFeature: "'tnum'"
rounded:
  label: "1px"
  plate: "2px"
  drawer: "3px"
  avatar: "4px"
  cabinet: "6px"
spacing:
  drawer-gap: "0.5rem"
  cabinet-pad: "0.75rem"
  gutter: "1.5rem"
  gutter-mobile: "1rem"
  section-end: "5rem"
components:
  drawer-small:
    backgroundColor: "{colors.steel-3}"
    rounded: "{rounded.drawer}"
    padding: "0.625rem 0.625rem 1.125rem"
    height: "4.625rem"
  drawer-big:
    backgroundColor: "{colors.steel-3}"
    rounded: "{rounded.drawer}"
    padding: "1.25rem 1.25rem 2rem"
  label-maintained:
    backgroundColor: "{colors.label}"
    textColor: "{colors.label-ink}"
    typography: "{typography.label-strip}"
    rounded: "{rounded.label}"
    padding: "0.3rem 0.55rem"
  label-dormant:
    textColor: "{colors.label}"
    typography: "{typography.label-strip}"
    rounded: "{rounded.label}"
    padding: "0.3rem 0.55rem"
  plate:
    backgroundColor: "{colors.steel-1}"
    textColor: "{colors.ink-2}"
    typography: "{typography.plate}"
    rounded: "{rounded.plate}"
    padding: "0.25rem 0.5rem"
  button-primary:
    backgroundColor: "{colors.label}"
    textColor: "{colors.label-ink}"
    rounded: "{rounded.plate}"
    padding: "0.45rem 0.85rem"
  button-primary-hover:
    backgroundColor: "{colors.label-hover}"
    textColor: "{colors.label-ink}"
  button-utility:
    backgroundColor: "{colors.steel-1}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.plate}"
    padding: "0.3rem 0.7rem"
  button-utility-hover:
    textColor: "{colors.ink}"
  social-link:
    backgroundColor: "{colors.steel-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "0.5rem 0.875rem"
  social-link-hover:
    textColor: "{colors.label}"
  lang-switch:
    backgroundColor: "{colors.steel-1}"
    textColor: "{colors.ink-3}"
    typography: "{typography.stamp}"
    rounded: "{rounded.drawer}"
    padding: "0.375rem 0.75rem"
  lang-switch-active:
    backgroundColor: "{colors.label}"
    textColor: "{colors.label-ink}"
  tray:
    backgroundColor: "{colors.steel-1}"
    rounded: "{rounded.drawer}"
    padding: "1.25rem 1.25rem 1.125rem"
---

# Design System: LukeZ

## Overview

**Creative North Star: "The Parts Cabinet"**

The site is one piece of dark, powder-coated steel furniture. Every project is a drawer in it; every drawer carries an orange label strip set in condensed caps and a stamped part number (LZ-01, LZ-02, ...). The visitor reads a nameplate, sees the flagship drawers on the top row, scans labelled rows of small drawers by category, and pulls one out to read what is inside. Nothing on the page pretends to be a card, a pill or a panel from a UI kit; it is all steel, label tape and stamping.

Density is workshop-high and quiet: many small drawers at once, low chroma everywhere except the labels, which are the only loud surface. Depth is physical and structural (a pressed bottom lip, a recessed pull handle, an inset tray), never atmospheric. The world is dark only; there is no light theme.

The system is shared by a single homepage and inherited by `/business`, `/discord-permissions` and `/textedit` through legacy `--color-*` aliases that point at the steel and label tokens.

**Key Characteristics:**

- Near-black blue-grey steel in six steps, from cabinet interior to highlight edge.
- One accent, the orange label strip, used as tape on labels, the active state, the primary action and selection.
- Archivo on its width axis: condensed and heavy for anything stamped or labelled, normal width for reading.
- JetBrains Mono only for stamped codes and data.
- State is a mark, not a color: solid label means maintained, hollow label means dormant.
- One motion grammar: drawers and trays slide on a single exponential ease-out.
- Text is not selectable by default; content worth copying opts in.

## Colors

A cold, nearly neutral steel ramp (hue 250, chroma under 0.01) with one warm, saturated orange that behaves like printed label tape.

### Primary

- **Label Orange** (`label`): the label strip on every drawer, the active language button, the primary tray action, link text on flagship drawers, focus rings and text selection. It is a material, not a highlight color.
- **Label Orange, Lit** (`label-hover`): hover state of solid-orange buttons only.
- **Label Ink** (`label-ink`): text printed on orange. Never use `ink` on `label`.

### Neutral

- **Cabinet Interior** (`steel-0`): the inside of the cabinet, the pull-handle recess, the footer and the scrollbar track.
- **Powder Coat** (`steel-1`): page background, tray interior, nameplates and utility buttons.
- **Drawer Shadow Side** (`steel-2`): lower half of the drawer-front gradient, row dividers, section rules, social links.
- **Drawer Face** (`steel-3`): upper half of the drawer-front gradient and the cabinet's top inner highlight.
- **Seam** (`steel-edge`): every 1px border on steel: drawers, cabinet, header rule, buttons.
- **Edge Highlight** (`steel-hi`): drawer top highlight, hover border on drawers and buttons, scrollbar thumb, underline color for quiet links.
- **Ink** (`ink`): headings, proof lines, hovered text. A faintly warm off-white.
- **Ink 2** (`ink-2`): body copy, descriptions, subtitles, plate text.
- **Ink 3** (`ink-3`): part numbers, counts, inactive controls, footer, the smallest headings.

### Named Rules

**The Label Tape Rule.** Orange appears as a material (filled tape, outlined tape, a 2px ring, a selection fill) or as link text. It is never a background wash, a tint behind a section, or a gradient.

**The Printed Ink Rule.** Anything set on orange uses `label-ink`; anything set on steel uses the `ink` steps. Selection inverts to `label` on `label-ink`.

## Typography

**Display Font:** Archivo Variable (with Segoe UI, Roboto, sans-serif), width axis 72-85%
**Body Font:** Archivo Variable at normal width
**Label/Mono Font:** JetBrains Mono 500 (with ui-monospace, Consolas, monospace)

**Character:** One family doing two jobs through its width axis: heavy and condensed when it is stamped onto steel or printed onto tape, plain and open when it is meant to be read. The mono is a stamping die, not a code font.

### Hierarchy

- **Display** (800, `clamp(3rem, 8vw, 5.5rem)`, line-height 0.9, width 72%, uppercase): the nameplate name only.
- **Headline** (800, `clamp(1.75rem, 2.6vw, 2.5rem)`, line-height 1.05, width 72%): the proof line on flagship drawers ("1000+ servers, since 2023"). Sentence case.
- **Title** (800, 1.75rem, width 75%, uppercase, 0.01em): section headings (Projects, About Me, Find Me).
- **Label Strip** (700, width 78%, uppercase, 0.03em, line-height 1.15): drawer labels; 1.5rem on flagship drawers (1.25rem on mobile), 0.8125rem on small drawers.
- **Plate** (700, 0.875rem, width 80%, uppercase, 0.06em): row nameplates and small side headings ("Tech I use"). The utility buttons (Details, Close) use the same caps-and-tracking at 600 weight, 0.8125rem.
- **Body** (400, 1rem, line-height 1.6): descriptions, capped at 70ch; summaries at 0.9375rem and 48ch.
- **Body Lead** (400, 1.125rem, line-height 1.7): the About paragraph, capped at 68ch.
- **Stamp** (JetBrains Mono 500, 0.75rem, tabular): part numbers, row counts, the project total, locale codes.

### Named Rules

**The Width Axis Rule.** Hierarchy is set by weight and width together. Labelled or stamped text is condensed (72-85%) and uppercase; reading text is never condensed.

**The Stamping Die Rule.** Monospace is reserved for codes and numbers that are stamped onto the furniture: part numbers, counts, locale codes. Never for prose, headings or buttons.

## Layout

A single centered column at `--max-width` (1280px) with a 1.5rem side gutter (1rem below 640px; the cabinet tightens to 0.75rem). The page is a vertical sequence: nameplate, the cabinet, About (text plus a 22rem tech-stack aside), Find Me (intro plus a wrapping rail of links), footer. Sections end with 5rem of space (3.5rem on mobile).

The cabinet is a grid of rows. Flagship drawers sit on the top row in `repeat(auto-fit, minmax(17rem, 1fr))`; small drawers fill `repeat(auto-fill, minmax(9rem, 1fr))`, with 0.5rem between drawers. Rows are separated by a 1px `steel-2` rule, each opened by a nameplate with its count. Each row owns one tray directly beneath it.

Breakpoints: at 900px the two-column About and Find Me sections stack. At 640px small drawers lock to two columns, flagship drawers to one, and the avatar shrinks from 96px to 56px.

The header is a fixed 60px rail with a 1px `steel-edge` bottom rule. On the homepage it carries only the language switch; elsewhere it adds the condensed wordmark.

## Elevation & Depth

Depth is mechanical: shadows describe how steel is pressed, recessed and pulled, not how things float. Every shadow belongs to the cabinet; nothing outside it (sections, links, text) carries one.

### Shadow Vocabulary

- **Cabinet body** (`box-shadow: inset 0 1px 0 var(--steel-3), 0 24px 48px -24px oklch(0% 0 0 / 0.7)`): the one large object on the page, with a lit top edge and a grounded drop.
- **Drawer front at rest** (`box-shadow: inset 0 1px 0 var(--steel-hi), inset 0 -5px 0 var(--steel-1), 0 2px 3px oklch(0% 0 0 / 0.35)`): lit top edge, a 5px pressed bottom lip, a tight contact shadow.
- **Drawer pulled** (adds `0 -6px 0 -2px var(--steel-0), 0 10px 18px -6px oklch(0% 0 0 / 0.6)`): the gap opening above the drawer and a deeper drop as it comes out 4px.
- **Pull handle** (`box-shadow: inset 0 2px 2px oklch(0% 0 0 / 0.6)` on `steel-0`): a recessed slot centered on the bottom of every drawer.
- **Tray interior** (`box-shadow: inset 0 8px 12px -8px oklch(0% 0 0 / 0.7)`): the inside of a drawer, shaded from its top edge.

### Named Rules

**The Pressed Steel Rule.** Depth comes from inset highlights, a pressed lip and recesses. The drawer face gets a two-stop vertical gradient (`steel-3` to `steel-2`) as its only sheen; no other surface uses a gradient.

## Shapes

Machined, nearly square corners that grow slightly with object size: label tape 1px, nameplates and buttons 2px, drawers, trays and the language switch 3px, the avatar 4px, the cabinet 6px. Every steel object carries a 1px border (`steel-edge` on drawers and controls, `steel-2` on plates, trays and section rules). The only curved form is the pull handle, a slot rounded on its bottom corners (`0 0 6px 6px`). Chevrons are drawn with two 2px borders, rotated.

## Components

### Drawers

The signature component. A drawer front is steel with a label, a part number and a pull handle.

- **Small drawer:** a full-surface button (min-height 4.625rem, 3.75rem on mobile). The label sits top-left, the part number below it, the handle centered at the bottom.
- **Flagship drawer:** an article holding the label and part number on one line, a headline proof line, a short summary, and an action row (a domain link in orange with an external-link icon, plus a Details utility button).
- **Hover:** border goes to `steel-hi`; small drawers lift 1px.
- **Pulled:** the drawer drops 4px, its border turns `label`, and the pulled shadow appears. One drawer per row is pulled at a time.

### Labels

- **Maintained:** solid orange tape, `label-ink` text, 1.5px orange border.
- **Dormant:** the same tape outlined: transparent fill, orange text, the same 1.5px border. The tray adds a plain-text dormant note in orange.

### Tray

The pulled-out drawer contents, one per row, directly beneath it. A `steel-1` box with a `steel-2` border and the tray-interior shadow. It holds a 1.25rem condensed title with its part number, the description, a solid-orange primary link ("Visit [project]") and a Close utility button. Closing returns focus to the drawer that opened it.

### Buttons

- **Primary:** solid `label` fill, `label-ink` text, 700 weight, 2px corners; hover lifts to `label-hover`. Used only for the tray's visit action.
- **Utility:** `steel-1` fill, `steel-edge` border, `ink-2` caps at 0.8125rem with 0.06em tracking. Hover brightens text to `ink` and border to `steel-hi`.
- **Social link:** `steel-2` fill, `steel-edge` border, `ink` text with an inline icon; hover turns border and text to `label`.

### Navigation

- **Language switch:** a joined two-segment control (EN, DE) in stamp mono, `ink-3` on `steel-1`, separated by a seam. The active locale is solid label tape.
- **Wordmark (non-home pages):** 800 weight, 75% width, uppercase, `ink`, turning `label` on hover.

### Nameplate

The page title block: a 96px avatar with a 4px corner and a seam border, the display name, and a subtitle in `ink-2` capped at 44ch.

## Do's and Don'ts

### Do:

- **Do** put every project in a drawer with a label strip and a stamped `LZ-NN` part number.
- **Do** mark state with the label itself: solid for maintained, hollow for dormant.
- **Do** animate only the drawer pull (300ms) and the tray slide (420ms on grid rows, 300ms fade), plus 150ms color and border changes, all on `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`). Remove the drawer and tray transitions under `prefers-reduced-motion: reduce`, and scroll instantly there.
- **Do** keep text unselectable by default and add `.selectable` to content worth copying: descriptions, summaries, tray titles, the About copy.
- **Do** use a 2px `label` focus ring with a 3px offset (inset -3px inside joined controls).
- **Do** set the body to tabular numerals.

### Don't:

- **Don't** add a light theme.
- **Don't** fill a label strip with any color but `label`, or set `ink` on it.
- **Don't** use JetBrains Mono for prose, headings or buttons.
- **Don't** put gradients on text, and don't use gradients anywhere except the drawer face.
- **Don't** introduce glass, blur or translucent panels.
- **Don't** round corners past 6px or use pill shapes.
- **Don't** add a second accent color or tint sections with orange.
