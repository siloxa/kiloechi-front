---
name: Kiloechi
description: Crispy fried chicken, ordered like at the counter. Persian, right-to-left, red and yellow.
colors:
  fryer-red: "#d40f14"
  fryer-red-deep: "#9c0b0f"
  board-black: "#1a0708"
  board-black-lit: "#2b0d0f"
  led-panel: "#000000"
  led-yellow: "#ffc400"
  led-yellow-soft: "#ffe27a"
  thermal-paper: "#fdfdfb"
  cool-counter: "#eceeee"
  thermal-ink: "#1a1414"
  ink-faded: "#5b5555"
  perforation: "#cfcac3"
  ok-green: "#157a3f"
  error-red: "#b00020"
  led-glow: "rgba(255, 196, 0, 0.5)"
  led-ring: "rgba(255, 196, 0, 0.2)"
  shadow-heat: "rgba(40, 0, 0, 0.55)"
  shadow-soft: "rgba(26, 7, 8, 0.25)"
  scrim: "rgba(26, 7, 8, 0.6)"
typography:
  display:
    fontFamily: "Lalezar, Vazirmatn, sans-serif"
    fontSize: "8.5rem"
    fontWeight: 400
    lineHeight: 1.05
  page:
    fontFamily: "Lalezar, Vazirmatn, sans-serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1.25
  heading:
    fontFamily: "Lalezar, Vazirmatn, sans-serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.3
  title:
    fontFamily: "Vazirmatn, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 800
    lineHeight: 1.45
  lead:
    fontFamily: "Vazirmatn, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 500
    lineHeight: 1.7
  body:
    fontFamily: "Vazirmatn, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  small:
    fontFamily: "Vazirmatn, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "Vazirmatn, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 800
    lineHeight: 1.4
  led-s:
    fontFamily: "Handjet, Vazirmatn, monospace"
    fontSize: "1.6rem"
    fontWeight: 800
    lineHeight: 1
  led-m:
    fontFamily: "Handjet, Vazirmatn, monospace"
    fontSize: "2.4rem"
    fontWeight: 800
    lineHeight: 1
  led-l:
    fontFamily: "Handjet, Vazirmatn, monospace"
    fontSize: "3.4rem"
    fontWeight: 800
    lineHeight: 1
  led-xl:
    fontFamily: "Handjet, Vazirmatn, monospace"
    fontSize: "7rem"
    fontWeight: 800
    lineHeight: 1
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  pill: "999px"
spacing:
  tear: "14px"
  tap: "44px"
components:
  button-ink:
    backgroundColor: "{colors.board-black}"
    textColor: "{colors.led-yellow}"
    rounded: "{rounded.sm}"
    height: "{spacing.tap}"
  button-red:
    backgroundColor: "{colors.fryer-red}"
    textColor: "{colors.thermal-paper}"
    rounded: "{rounded.sm}"
    height: "{spacing.tap}"
  button-yellow:
    backgroundColor: "{colors.led-yellow}"
    textColor: "{colors.board-black}"
    rounded: "{rounded.sm}"
    height: "{spacing.tap}"
  add-button:
    backgroundColor: "{colors.fryer-red}"
    textColor: "{colors.thermal-paper}"
    rounded: "{rounded.pill}"
    size: "{spacing.tap}"
  stepper:
    backgroundColor: "{colors.board-black}"
    textColor: "{colors.led-yellow}"
    typography: "{typography.led-s}"
    rounded: "{rounded.pill}"
  slip:
    backgroundColor: "{colors.thermal-paper}"
    textColor: "{colors.thermal-ink}"
    rounded: "{rounded.xs}"
  stamp:
    textColor: "{colors.fryer-red}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
  board-readout:
    backgroundColor: "#000000"
    textColor: "{colors.led-yellow}"
    typography: "{typography.led-m}"
    rounded: "{rounded.sm}"
  tab-selected:
    backgroundColor: "{colors.thermal-paper}"
    textColor: "{colors.thermal-ink}"
    rounded: "{rounded.xs}"
---

# Design System: Kiloechi — The Counter Ticket

## Overview

**Creative North Star: "The Counter Ticket" (فیش و شماره)**

Ordering at Kiloechi works like ordering at an Iranian fast-food counter. You take a slip, your number lights up on the red-and-black call board, and it is called hot. The site refuses the delivery-app default of a split photo hero over a row of equal product cards. Its parts are the counter's own: a near-black **call board** with yellow LED readouts across the top of every page, **thermal slips** with torn edges that hold the menu, **red rubber stamps** that land when something changes, and **status lamps** that light one by one.

Public pages (home, menu) persuade on a saturated fryer-red field. Working screens (cart, checkout, account, admin) keep the same materials but quieter, with paper on red for customers and a cool counter grey for staff. Everything shown on the board is true: the visitor's own order number and status, or today's real count of discounted dishes, never invented numbers.

**Key Characteristics:**
- The board is the horizon of every page: sticky, edge to edge, a dot grille behind yellow dot-matrix numerals.
- One slip row is the ruler for every dish on every page (photo, name, description, price, add control).
- Red stamps appear only on state change: discounted, added, delivered, cancelled.
- The added dish lifts forward and prints a new line onto "your slip".
- Persian right-to-left throughout, Persian digits, Toman prices, Solar Hijri dates.

## Colors

**Committed** strategy: fryer red owns most of the customer site; board black and LED yellow carry the counter hardware; thermal paper carries content.

### Primary
- **Fryer Red** `#d40f14`: the page field on customer pages, add buttons, stamps, the red price strike. White text on it is 5.3:1.
- **LED Panel** `#000000`: the unlit panel behind board readouts and the active admin item.
- **Board Black** `#1a0708` (lit state `#2b0d0f`): the call board, footer, LED housings, primary "ink" buttons, the admin sidebar, and rail headers.

### Secondary
- **LED Yellow** `#ffc400`: LED numerals and words, the hero headline, selected states on the board. Yellow on board black is 11.8:1. Yellow on red is 3.8:1, so it is display-size only.
- **LED Yellow Soft** `#ffe27a`: secondary LED captions, the paper-feed highlight, kitchen notes.

### Neutral
- **Thermal Paper** `#fdfdfb`: every slip, form surface, and card. Cool white, never cream.
- **Cool Counter** `#eceeee`: the admin workspace ground and image placeholders.
- **Thermal Ink** `#1a1414` text and **Ink Faded** `#5b5555` secondary text (7:1 on paper).
- **Perforation** `#cfcac3`: dashed rules, field underlines, tear-off borders.
- **OK Green** `#157a3f` (savings, completed) and **Error Red** `#b00020` (errors).

**The Yellow-on-Red Rule.** Yellow sits on red only at display size (the hero headline). Every other yellow text sits on board black.

**The Cream Ban Rule.** Paper is thermal white `#fdfdfb` and the admin ground is cool `#eceeee`. Warm cream grounds are out.

## Typography

- **Lalezar** is the display voice: hero, page titles, slip titles, section headings. It is the lettering of Tehran's Lalezar Street cinema posters, the Persian counterpart of a loud fast-food sign.
- **Vazirmatn** (400–900) is the text and UI face.
- **Handjet** is the LED face, loaded with its element axes and always set at `font-variation-settings: 'ELSH' 16, 'ELGR' 1` so numerals render as round-dot matrix. It carries Persian digits but no Persian letters, so LED *words* are Vazirmatn 800 in yellow with the same glow.

### Hierarchy
Display `clamp(3.4rem, 8.5vw, 8.5rem)` → page 3rem → heading 2rem → title 1.35rem → lead 1.15rem → body 1rem (line height 1.7) → small 0.875rem → caption 0.8rem. LED sizes: s 1.6rem (steppers, cart, counts), m 2.4rem (board readouts, admin readouts), l 3.4rem (lamp band), xl `clamp(4rem, 10vw, 7rem)` (your order number). In CSS every size is a `--fs-*` or `--led-*` token.

**The One LED Face Rule.** Numbers that are live data (counts, order numbers, quantities) are Handjet dot-matrix. Prices are Vazirmatn with tabular figures, because they are printed, not lit.

## Layout

Right-to-left throughout, built with logical properties (`inset-inline-*`, `margin-inline-*`, `text-align: start/end`). Content max width is 1240px with a 16px gutter. Grid columns that hold content use `minmax(0, 1fr)` so wide content scrolls inside its box instead of widening the page.

- **Home:** the board, then the hero. The copy (headline, lead, CTA) sits at the inline-start with a framed photo below it. Today's slip sits at the inline-end, hanging from a printer bar that meets the board's bottom edge. Below come the lamp band ("از فیش تا در خانه"), today's deals as one wide slip, then the menu by category as a grid of slips.
- **Phones (≤640px):** copy, then a 16:7 framed photo, then today's slip, so food and the add control are in the first screen. The hero CTA hides, because the slip's own button replaces it.
- **Breakpoints:** 1080px collapses the board nav into a menu button and moves "your slip" to the bottom bar; 640px is the phone layout; admin collapses its sidebar into a drawer at 900px and stacks the order rail at 640px.

## Elevation & Depth

- `--shadow-slip` `0 22px 40px -20px` heat-tinted: slips, framed photos, "your slip".
- `--shadow-sm` `0 4px 10px -4px`: buttons, admin cards, the printer bar.
- LED glow (`text-shadow 0 0 14px` LED glow) is emission, not depth, and appears only on board elements.
- The board has a 6px fryer-red-deep lip on its bottom edge; the footer mirrors it on top.

## Shapes

- **Slip edge:** a sawtooth tear (`--tear: 14px`, 10px on admin tickets) made with a conic-gradient mask. It is the real edge of a blade-torn thermal slip.
- **Radius:** xs 4px (slips, stamps, tabs), sm 8px (buttons, readouts, photos), md 12px (framed photos, bottom bar), and pill for the add button, stepper and account pill.
- **Selected pattern:** the LED dot grille (`--led-dots`) under the active board link, the active admin item and active admin chips. A selected menu tab becomes paper with a perforated red-dot edge.

## Components

### Buttons
At least 44px tall. **Ink** (board black + LED yellow) is the main call to action on red and paper. **Red** is for primary actions on paper. **Yellow** is for secondary actions on red. **Line** is an outline in current colour. **Danger** is an error-red outline.

### Slip
Thermal paper with a torn bottom edge. A head row holds the Lalezar title and the meta (date, count), above a 2px dashed perforation; a foot holds totals and actions above another perforation. Wide variant: rows flow two or three across.

### Slip row (the ruler)
A 76px photo (64px on phones), a 800-weight name, a faded description, and at the end: the price (stamp, then new price, then struck old price), then the add control. The row lifts its photo forward for 700ms after an add.

### Add control
A red 44px "+" that turns into a board-black LED quantity stepper once the dish is on your slip.

### Stamp
Fryer-red bordered text, rotated -6deg, `mix-blend-mode: multiply`, masked with a fractal-noise ink texture. Small stamps (prices, "added", history) use the light impression `--ink-mask-light`. Big stamps (delivered, cancelled on an order slip) use the hard `--ink-mask` and land with a short press. The void variant (cancelled) is ink-faded.

### Call board
Sticky board-black bar with a dot grille: logo; LED readout (your order number and status, or today's deal count); nav; search; LED cart count; account pill.

### Your slip
Desktop: prints down out of the board after an add, stays while hovered or focused, then retracts after 3.5s. Phones: the board-black bottom bar (LED count, total, "ادامه"), with the slip feeding up out of it after an add.

### Status lamps
Five labeled lamps (pending → confirmed → preparing → on the way → delivered). Lit lamps are yellow with glow; the current lamp pulses; the paper variant lights red. A lamp always carries its label, never colour alone.

### Admin order rail
Four board-black stage headers with LED counts. Each order is a slip ticket with lines, kitchen note, customer, address, payment and total, and one "next stage" button (plus cancel while pending or confirmed). On phones the stages stack vertically.

## Do's and Don'ts

### Do:
- Do show only true data on the board and in the footer; hide what the owner hasn't provided.
- Do keep every dish in the same slip row, on every page.
- Do mark discounts on the price itself: struck old price plus a red stamp.
- Do keep tap targets at least 44px and focus rings visible (yellow on dark and red, deep red on paper).
- Do respect `prefers-reduced-motion`: no lift, press or feed movement; fades only.

### Don't:
- Don't use emoji or Unicode glyphs as icons; use the 2px-stroke SVG set in `components/Icons.jsx`.
- Don't invent testimonials, branches, ratings, order numbers or prices.
- Don't put yellow text on red below display size.
- Don't use warm cream grounds, gradient text, glass effects, or thick one-side accent borders.
- Don't add a generic numbered "how it works" strip; the status lamps tell that story.
