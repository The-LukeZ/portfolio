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

<!-- impeccable:design-map -->
Name: LukeZ
Colors: primary: label oklch(75.053% 0.17907 58.273); neutral: steel-0 oklch(13.5% 0.004 250); primary: label-hover oklch(80.357% 0.16873 73.344); primary: label-ink oklch(22% 0.045 58) (+8 more in the sidecar)
Fonts: Archivo Variable (display, headline, title, label-strip, plate, body, body-lead); JetBrains Mono (stamp)
Spacing: drawer-gap 0.5rem, cabinet-pad 0.75rem, gutter 1.5rem, gutter-mobile 1rem, section-end 5rem
Radius: label 1px, plate 2px, drawer 3px, avatar 4px, cabinet 6px
North Star: "The Parts Cabinet"
Rules:
- The Label Tape Rule. Orange appears as a material (filled tape, outlined tape, a 2px ring, a selection fill) or as link text.
- The Printed Ink Rule. Anything set on orange uses `label-ink`; anything set on steel uses the `ink` steps.
- The Width Axis Rule. Hierarchy is set by weight and width together.
- The Stamping Die Rule. Monospace is reserved for codes and numbers that are stamped onto the furniture: part numbers, counts, locale codes.
- The Pressed Steel Rule. Depth comes from inset highlights, a pressed lip and recesses.
Elevation:
- Cabinet body: inset 0 1px 0 var(--steel-3), 0 24px 48px -24px oklch(0% 0 0 / 0.7)
- Drawer front at rest: inset 0 1px 0 var(--steel-hi), inset 0 -5px 0 var(--steel-1), 0 2px 3px oklch(0% 0 0 / 0.35)
- Drawer pulled (adds 0 -6px 0 -2px var(--steel-0), 0 10px 18px -6px oklch(0% 0 0 / 0.6)): the gap opening above the drawer and a deeper drop as it comes out 4px.
- Pull handle: inset 0 2px 2px oklch(0% 0 0 / 0.6)
- Tray interior: inset 0 8px 12px -8px oklch(0% 0 0 / 0.7)
Don't:
- Don't add a light theme.
- Don't fill a label strip with any color but `label`, or set `ink` on it.
- Don't use JetBrains Mono for prose, headings or buttons.
- Don't put gradients on text, and don't use gradients anywhere except the drawer face.
- Don't introduce glass, blur or translucent panels.
- Don't round corners past 6px or use pill shapes.
- Don't add a second accent color or tint sections with orange.
Do:
- Do put every project in a drawer with a label strip and a stamped `LZ-NN` part number.
- Do mark state with the label itself: solid for maintained, hollow for dormant.
- (+4 more)
Full: .impeccable/design-full.md (read a section when you need its detail)
