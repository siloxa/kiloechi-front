# Kiloechi – Fried Chicken Ordering Website

Online menu and ordering for Kiloechi, built from the "Simple Fried Chicken Website" Figma design. The site is **Persian (right-to-left)**, with prices in **Toman** and dates in the Solar Hijri calendar. It has:

- **Public site**: hero, menu carousel, the "کمبو اقتصادی" (combo) banner and footer, plus a full menu page with category, promo and search filters.
- **Customer panel**: register/login with **username and password**, cart, checkout (pay on delivery, or card-to-card once the restaurant's card number is set), order history with live status tracking, cancel a pending order, reorder, and profile/password editing.
- **Admin panel** (`/admin`, its own login at `/admin/login`): sales dashboard, product create/edit/delete with photo upload, **per-product discounts** with optional start/end dates, **bulk discounts** across selected products, show/hide and "featured" toggles, categories, order management with status updates, a customer list, and a **Settings** page for the restaurant's address, phone, hours, Instagram/Telegram and card number. Anything left empty stays hidden on the site, so nothing is invented.

Stack: React + Vite (frontend), Express (API), SQLite through Node's built-in `node:sqlite` (no database server needed), JWT auth.

## Run it

Requires **Node 22.13+** (Node 24 recommended).

```bash
npm install
npm run dev
```

- Website (customer panel): http://localhost:5173
- Admin panel: http://localhost:5173/admin (sign in at http://localhost:5173/admin/login)

On first start the app creates the database in `data/`, a starter menu, and an admin account:

| | |
|---|---|
| Username | `admin` |
| Password | `admin123` |

**Change this before going live.** Either set `ADMIN_USERNAME` / `ADMIN_PASSWORD` before the first start, or sign in at `/admin/login` and change it under **حساب من و رمز عبور** in the admin sidebar (`/admin/account`).

## Production

```bash
npm run build      # builds the React app into dist/
npm start          # serves the API and the built site on PORT (default 3001)
```

Environment variables:

| Variable | Purpose |
|---|---|
| `PORT` | Port for `npm start` (default `3001`) |
| `JWT_SECRET` | Secret used to sign logins. If unset, a random one is generated and saved in `data/.jwt-secret` |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | First admin account (used only when no admin exists yet) |

Back up the `data/` (database) and `uploads/` (product photos) folders.

## Accounts

- **The two panels are separate.** Customers sign in at `/login`, staff at `/admin/login`. Each login page only accepts its own kind of account, and each panel keeps its own session, so signing in or out of one never affects the other. Admin sessions last 12 hours, customer sessions 30 days.

- Everyone logs in with a **username** (3–30 Latin letters, digits, dot or underscore; not case-sensitive) and a password of at least 6 characters. There is no email.
- Databases created by the earlier email-based version are migrated automatically on start: each username becomes the part of the email before "@" (for example `admin@kiloechi.test` → `admin`), with a number added if two would clash.

## How prices and discounts work

- Prices are whole Toman. Formatting (Persian digits, "تومان") lives in `client/src/lib/format.js`. **The starter menu prices are placeholders:** set your real prices in Admin → Products.
- Phone and card numbers typed with Persian digits are converted automatically.
- Discounts are a percentage per product. With dates set, they are only active from the start day 00:00 to the end day 23:59 (server time).
- The server always recalculates prices when an order is placed. The browser only sends product IDs and quantities, so customers cannot change prices.
- Each order stores a copy of item names and prices. Editing or deleting a product later doesn't change past orders.

## Design: "The Counter Ticket" (فیش و شماره)

The site is built like ordering at the counter. A near-black **call board** runs across the top of every page, with yellow LED readouts that only show true data: your own order number and status when you're signed in, otherwise today's real count of discounted dishes. The menu is a set of **thermal slips** with torn edges; adding a dish prints it onto **your slip**, which feeds down out of the board on desktop or sits as a bar along the bottom on phones. Discounts are **red stamps** on the price itself. Order tracking is your number on the board with labeled status **lamps**. In the admin panel, open orders sit on a **kitchen ticket rail** (one column per stage, one button to move an order on).

Fonts: Lalezar (headlines), Vazirmatn (text), Handjet (LED numbers). Every colour, size and radius is a token at the top of `client/src/styles.css`; DESIGN.md documents them.

### Your logo and photos

- **Logo:** save it as `client/public/logo.svg` (or .png) and follow the one-line note in `client/src/components/Logo.jsx`.
- **Food photos:** upload them per dish in Admin → محصولات و تخفیف‌ها → ویرایش → بارگذاری عکس. Square photos (or cut-outs on a plain background) look best in the slip rows.
- **Homepage photo:** replace `HERO_IMG` in `client/src/pages/Home.jsx` with one of your own photos (put the file in `client/public/` and use `/your-photo.jpg`).

## Design and project skills

- `PRODUCT.md`: who the site is for and what must stay true. `DESIGN.md`: colors, fonts and component rules (impeccable format).
- `.claude/skills/` holds the project skills (impeccable, ui-ux-pro-max, design-md-library, graphify). `CLAUDE.md` tells Claude to use them for all work here.
- `graphify-out/` is a code knowledge graph. Refresh it after code changes with `graphify update .`.

## Project layout

```
server/
  index.js          Express app
  db.js             SQLite schema
  pricing.js        discount logic
  auth.js           JWT + role guards
  seed.js           starter menu + first admin
  routes/           auth, catalog, orders, admin
client/src/
  pages/            Home, Menu, Cart, Checkout, Auth, account/, admin/
  components/       Navbar, Footer, ProductCard, Icons
  lib/              api client, auth + cart state, formatting
```

## Notes

- Starter product photos are Unsplash links. Replace them with your own in **Admin → Products → Edit → Upload photo**.
- Online payment isn't included. Checkout offers pay-on-delivery or card-to-card, which staff confirm by changing the order status. An Iranian gateway (e.g. Zarinpal) can be added in `server/routes/orders.js`.
- Fill in **Admin → اطلاعات رستوران** (Settings) before launch; the footer and the card-to-card option appear only once those details exist.
- To reset everything, stop the server and delete the `data/` and `uploads/` folders.
