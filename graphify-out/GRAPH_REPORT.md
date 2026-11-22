# Graph Report - kiloechi  (2026-11-22)

## Corpus Check
- 49 files · ~19,509 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 287 nodes · 769 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- admin.js
- Account.jsx
- App.jsx
- package.json
- Icons.jsx
- Design System: Kiloechi
- Product
- Settings.jsx
- Kiloechi – Fried Chicken Ordering Website
- Cart.jsx
- Kiloechi – project instructions
- Surface brief: Kiloechi site (home, menu, cart, checkout, account) + admin panel

## God Nodes (most connected - your core abstractions)
1. `api()` - 38 edges
2. `formatNumber()` - 32 edges
3. `react` - 27 edges
4. `App()` - 24 edges
5. `formatMoney()` - 23 edges
6. `react-router-dom` - 19 edges
7. `useAuth()` - 18 edges
8. `useCart()` - 16 edges
9. `Cart()` - 13 edges
10. `Navbar()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `SiteLayout()` --calls--> `Footer()`  [EXTRACTED]
  client/src/App.jsx → client/src/components/Footer.jsx
- `SiteLayout()` --calls--> `Navbar()`  [EXTRACTED]
  client/src/App.jsx → client/src/components/Navbar.jsx
- `SiteLayout()` --calls--> `YourSlip()`  [EXTRACTED]
  client/src/App.jsx → client/src/components/YourSlip.jsx
- `SiteLayout()` --calls--> `useCart()`  [EXTRACTED]
  client/src/App.jsx → client/src/lib/cart.jsx
- `App()` --calls--> `Account()`  [EXTRACTED]
  client/src/App.jsx → client/src/pages/account/Account.jsx

## Import Cycles
- None detected.

## Communities (12 total, 1 thin omitted)

### Community 0 - "admin.js"
Cohesion: 0.08
Nodes (39): express, publicUser(), requireAdmin, requireAuth, SECRET, signToken(), DATA_DIR, db (+31 more)

### Community 1 - "Account.jsx"
Cohesion: 0.12
Nodes (38): CheckIcon(), YourSlip(), api(), KEYS, scopeFor(), tokenStores, formatDate(), formatDay() (+30 more)

### Community 2 - "App.jsx"
Cohesion: 0.17
Nodes (22): App(), NotFound(), ScrollManager(), SiteLayout(), EyeIcon(), EyeOffIcon(), PasswordInput(), AuthContext (+14 more)

### Community 3 - "package.json"
Cohesion: 0.08
Nodes (30): dependencies, bcryptjs@^3.0.3, express@^5.3.0, jsonwebtoken@^9.0.3, multer@^2.5.0, react@^19.3.1, react-dom@^19.3.1, react-router-dom@^7.18.6 (+22 more)

### Community 4 - "Icons.jsx"
Cohesion: 0.12
Nodes (26): Footer(), base, CartIcon(), ClockIcon(), CloseIcon(), DashboardIcon(), InstagramIcon(), MenuIcon() (+18 more)

### Community 5 - "Design System: Kiloechi"
Cohesion: 0.08
Nodes (24): Add control, Admin order rail, Buttons, Call board, Colors, Components, Design System: Kiloechi — The Counter Ticket, Do: (+16 more)

### Community 6 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 7 - "Settings.jsx"
Cohesion: 0.67
Nodes (3): setSettingsCache(), FIELDS, Settings()

### Community 8 - "Kiloechi – Fried Chicken Ordering Website"
Cohesion: 0.18
Nodes (10): Accounts, Design and project skills, Design: "The Counter Ticket" (فیش و شماره), How prices and discounts work, Kiloechi – Fried Chicken Ordering Website, Notes, Production, Project layout (+2 more)

### Community 9 - "Cart.jsx"
Cohesion: 0.22
Nodes (17): DrumstickIcon(), FlameIcon(), MinusIcon(), PlusIcon(), TrashIcon(), AddControl(), DiscountBadge(), Price() (+9 more)

### Community 11 - "Surface brief: Kiloechi site (home, menu, cart, checkout, account) + admin panel"
Cohesion: 0.50
Nodes (3): Direction contract, Surface brief: Kiloechi site (home, menu, cart, checkout, account) + admin panel, Unresolved

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `Account.jsx`, `package.json`, `Icons.jsx`, `Settings.jsx`, `Cart.jsx`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **Should `admin.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0780399274047187 - nodes in this community are weakly interconnected._
- **Why does `express` connect `admin.js` to `package.json`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Should `Account.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12159863945578231 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `App.jsx` to `Account.jsx`, `package.json`, `Icons.jsx`, `Cart.jsx`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07862903225806452 - nodes in this community are weakly interconnected._
- **Should `Icons.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._