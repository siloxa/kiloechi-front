# Kiloechi – project instructions

Fried-chicken restaurant site (React + Vite client, Express + node:sqlite API). See README.md for running it.

## Always use the project skills (`.claude/skills/`)

The owner wants every piece of work on this project to go through these skills. Load the matching skill's SKILL.md and follow it before starting:

| Work | Skill(s) |
|---|---|
| Any UI work (new page, component, restyle, fix, review) | **impeccable** (run its `scripts/impeccable context` setup first, read `reference/craft-floor.md` before UI edits) **and** **ui-ux-pro-max** (query `search.py` for the concern; follow its priority checklist) |
| Design reference / "make it look like X" / new design language | **design-md-library**, then record the choice in DESIGN.md |
| Questions about the codebase, architecture, or "where/how does X work" | **graphify**: query `graphify-out/` (`graphify query/explain/path`). After code changes run `graphify update .` (the CLI is `graphify.exe` in the user's Python Scripts folder; excludes are in `graphify-out/.graphify_build.json`) |

Ground rules:
- The visual identity comes from the Figma "Simple Fried Chicken Website" design (the "Counter Ticket" world in DESIGN.md: fryer red #d40f14, board black, LED yellow #ffc400; Lalezar display, Vazirmatn text, Handjet dot-matrix LED numerals). Treat changes as **refinement** of that world, not a redesign, unless the owner asks for one.
- PRODUCT.md and DESIGN.md at the repo root are the source of truth for product context and design tokens; keep them current when the design changes.
- The site is **Persian, RTL, Toman** for a **real restaurant**: never invent testimonials, addresses, branches or claims (see PRODUCT.md). Use logical CSS properties.
- Admin and account pages are "Operate" surfaces (clarity first); the homepage and menu are "Persuade" surfaces.
