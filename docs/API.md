# Kiloechi — Backend API Specification

This document lists every API the Kiloechi frontend calls, with request and response shapes and the rules the backend must enforce. A working reference implementation exists in `server/` (Express + SQLite). Treat it as the source of truth for behaviour: if you rebuild the backend in another stack, it must match this contract so the React frontend keeps working unchanged.

Part 2 lists the APIs the project **still needs** before going live.

---

## 1. Conventions

| Topic | Rule |
|---|---|
| Base URL | All endpoints are under `/api`. Uploaded images are served from `/uploads/<file>`. |
| Format | JSON request and response bodies (`Content-Type: application/json`), except the image upload, which is `multipart/form-data`. |
| Language | Error messages are **Persian** and are shown to users as-is: `{ "error": "نام کاربری یا رمز عبور اشتباه است" }`. |
| Money | Whole **Toman**, as integers. No decimals, no currency conversion on the server. |
| Digits | Phone numbers, card numbers and usernames may arrive with Persian (`۰-۹`) or Arabic (`٠-٩`) digits. Convert them to ASCII digits before validating and storing. |
| Timestamps | `created_at` is UTC, `"YYYY-MM-DD HH:MM:SS"`. The frontend converts to the Solar Hijri calendar for display. |
| Discount dates | `"YYYY-MM-DD"`, interpreted in the **restaurant's local time**: the start day from 00:00, the end day until 23:59:59, both inclusive. |
| Empty success | `204 No Content` for deletes. |

### Status codes

| Code | Meaning |
|---|---|
| 200 / 201 | OK / created |
| 204 | Deleted, no body |
| 400 | Validation failed (`error` says what) |
| 401 | Not signed in, token expired or invalid, or a token from the wrong panel |
| 403 | Signed in, but not allowed (e.g. an admin account on the customer login) |
| 404 | Not found |
| 409 | Conflict (username taken, category exists) |

### Authentication: two separate panels

The customer site and the admin panel have **separate sessions**. Both use a JWT bearer token:

```
Authorization: Bearer <token>
```

Token claims: `sub` (user id), `role` (`customer` | `admin`), `scope` (`customer` | `admin`).

- **Customer tokens** come from `/api/auth/login` or `/api/auth/register`. They last **30 days** and only work on customer endpoints (`/api/auth/me`, `/api/orders/*`).
- **Admin tokens** come from `/api/admin/login`. They last **12 hours** and only work on `/api/admin/*` endpoints and `PUT /api/admin/settings`.
- A token used on the other panel's endpoints must get **401**, even when the user is valid.
- On any 401 from a signed-in request, the frontend clears that panel's session and goes to that panel's login page.

---

## 2. Data shapes

### User (as returned; `password_hash` is never returned)

```json
{
  "id": 3,
  "name": "سارا نمونه",
  "username": "sara_n",
  "phone": "09120000000",
  "address": "تهران، ...",
  "role": "customer",
  "created_at": "2026-11-22 06:50:12"
}
```

### Product (as returned; prices already computed by the server)

```json
{
  "id": 2,
  "name": "فیلهٔ سوخاری",
  "description": "فیلهٔ مرغ سوخاری با سس تند و شیرین.",
  "price": 380000,
  "image": "/uploads/1795...-a1b2.jpg",
  "category_id": 1,
  "category": "مرغ سوخاری",
  "discount_percent": 10,
  "discount_start": null,
  "discount_end": "2026-12-01",
  "is_active": true,
  "is_featured": true,
  "created_at": "2026-11-22 06:45:00",
  "discount_active": true,
  "effective_discount": 10,
  "final_price": 342000
}
```

- `discount_active`: whether the discount applies **right now**. It is true when `discount_percent > 0` and today falls within `discount_start`/`discount_end`; a missing date means open-ended.
- `effective_discount`: `discount_percent` when active, otherwise `0`.
- `final_price`: `round(price × (100 − effective_discount) / 100)`.

### Category

```json
{ "id": 1, "name": "مرغ سوخاری" }
```

### Order

```json
{
  "id": 12,
  "user_id": 3,
  "status": "preparing",
  "subtotal": 1214000,
  "discount_total": 138000,
  "total": 1076000,
  "customer_name": "سارا نمونه",
  "phone": "09120000000",
  "address": "تهران، ...",
  "note": "تندتر لطفاً",
  "payment_method": "cod",
  "created_at": "2026-11-22 07:10:03",
  "items": [
    {
      "id": 31,
      "order_id": 12,
      "product_id": 2,
      "name": "فیلهٔ سوخاری",
      "image": "/uploads/...",
      "unit_price": 380000,
      "final_price": 342000,
      "discount_percent": 10,
      "quantity": 2
    }
  ]
}
```

- `status` is one of: `pending` → `confirmed` → `preparing` → `delivering` → `completed`, or `cancelled`.
- `payment_method` is `cod` (pay on delivery, cash or card reader) or `transfer` (card-to-card after confirmation).
- `items` are a **snapshot**: name, image and prices are copied when the order is placed, so later product edits or deletes never change past orders. `product_id` may point to a deleted product.

### Restaurant settings

```json
{
  "address": "", "phone": "", "hours": "",
  "instagram": "", "telegram": "",
  "card_number": "", "card_holder": ""
}
```

An empty string means "not provided". The frontend hides empty fields, and offers card-to-card payment only when `card_number` is set.

---

## 3. Public endpoints (no token)

### `GET /api/products`
Active products only (`is_active = true`), sorted featured first, then by id.

Optional query parameters:

| Param | Effect |
|---|---|
| `category=<id>` | Only that category |
| `q=<text>` | Case-insensitive match on name or description |
| `promo=1` | Only products whose discount is active now |

**200** → `Product[]`

### `GET /api/products/:id`
**200** → `Product` · **404** if missing or inactive.

### `GET /api/categories`
**200** → `Category[]`, sorted by name.

### `GET /api/settings`
**200** → restaurant settings (see above).

---

## 4. Customer authentication

### `POST /api/auth/register`
```json
{ "name": "سارا نمونه", "username": "Sara_N", "password": "secret1", "phone": "۰۹۱۲۰۰۰۰۰۰۰" }
```
Rules:
- `name` is required.
- `username`: lowercase it and convert digits, then it must match `^[a-z0-9_.]{3,30}$`. It must be unique and not case-sensitive (**409** if taken).
- `password` must be at least 6 characters; store it as a bcrypt hash.
- `phone` is optional; convert its digits.
- New users always get `role = "customer"`.

**201** → `{ "token": "<customer jwt>", "user": User }`

### `POST /api/auth/login`
```json
{ "username": "sara_n", "password": "secret1" }
```
**200** → `{ token, user }`
· **401** wrong username or password (one message for both cases)
· **403** if the account is an admin: admins must use `/api/admin/login`.

### `GET /api/auth/me` 🔒 customer
**200** → `{ "user": User }`

### `PUT /api/auth/me` 🔒 customer
```json
{ "name": "...", "phone": "...", "address": "...", "currentPassword": "old", "newPassword": "new123" }
```
All fields are optional; missing fields keep their value. The password changes only when `newPassword` is present, and then `currentPassword` must be correct (**400** otherwise) and `newPassword` must be at least 6 characters. The username can't be changed.

**200** → `{ "user": User }`

---

## 5. Customer orders 🔒 customer token

### `POST /api/orders`
```json
{
  "items": [ { "productId": 2, "quantity": 2 }, { "productId": 4, "quantity": 1 } ],
  "name": "سارا نمونه",
  "phone": "09120000000",
  "address": "تهران، ...",
  "note": "تندتر لطفاً",
  "payment_method": "cod"
}
```
Rules. These are critical: never trust prices from the client.
- `items` must not be empty. Each `quantity` is an integer from 1 to 99. Every `productId` must exist and be active (**400** otherwise).
- The server **recalculates every price** from the database at the moment of ordering (current discount included). Prices sent by the client are ignored.
- `subtotal = Σ price × qty`, `total = Σ final_price × qty`, `discount_total = subtotal − total`.
- `name`, `phone` and `address` are required. `note` is cut to 500 characters. `payment_method` defaults to `cod` when it isn't `cod` or `transfer`.
- Create the order and all its items in **one transaction**.
- Save the given phone and address on the user's profile, as defaults for next time.

**201** → `Order` (with `items`)

### `GET /api/orders/mine`
**200** → `Order[]` for the signed-in customer, newest first, each with `items`. The frontend polls this about **every 20 seconds** to update the status lamps.

### `POST /api/orders/:id/cancel`
Only the order's owner can cancel, and only while `status = "pending"`.
**200** → updated `Order` · **404** if not theirs · **400** if not pending.

---

## 6. Admin panel 🔒 admin token (except login)

### `POST /api/admin/login` (public)
```json
{ "username": "admin", "password": "..." }
```
**200** → `{ "token": "<admin jwt>", "user": User }` · **401** for wrong credentials **or** a non-admin account (same message).

### `GET /api/admin/me` · `PUT /api/admin/me`
Same as the customer `/me` endpoints, for the signed-in admin (name and password change).

### `GET /api/admin/stats`
Dashboard figures. Revenue excludes cancelled orders; "today" uses the restaurant's local date.
```json
{
  "revenue": 4520000,
  "revenueToday": 1076000,
  "orders": 18,
  "openOrders": 4,
  "customers": 11,
  "products": 7,
  "onPromo": 3,
  "topProducts": [ { "name": "کمبو اقتصادی", "qty": 9, "revenue": 4968000 } ],
  "recentOrders": [ { "...order row without items..." : "" } ]
}
```
- `openOrders` counts orders that are pending, confirmed, preparing or delivering.
- `topProducts` lists the top 5 by quantity, from non-cancelled orders.
- `recentOrders` holds the last 6 orders.
- The panel polls this about every 20 seconds for the "open orders" counter.

### Products

| Method & path | Body | Result |
|---|---|---|
| `GET /api/admin/products` | — | `Product[]` **including inactive**, newest first |
| `GET /api/admin/products/:id` | — | `Product` · 404 |
| `POST /api/admin/products` | product body | **201** `Product` |
| `PUT /api/admin/products/:id` | product body (full) | `Product` · 404 |
| `DELETE /api/admin/products/:id` | — | **204** · 404 (past orders keep their snapshot) |
| `POST /api/admin/products/bulk-discount` | see below | `{ "updated": n }` |

Product body:
```json
{
  "name": "فیلهٔ سوخاری",
  "description": "...",
  "price": 380000,
  "image": "/uploads/... or https://...",
  "category_id": 1,
  "discount_percent": 10,
  "discount_start": "2026-11-25",
  "discount_end": "2026-12-01",
  "is_active": true,
  "is_featured": false
}
```
Validation:
- `name` is required.
- `price` is an integer ≥ 0.
- `discount_percent` is an integer from 0 to 100.
- Dates are `YYYY-MM-DD` or null, and the start must not be after the end.
- With `discount_percent = 0`, store both dates as null.
- `category_id` is null or an existing category.
- `is_active` is false only when explicitly `false` or `0`.

Bulk discount body. `discount_percent: 0` removes the discount and clears the dates:
```json
{ "ids": [1, 2, 5], "discount_percent": 15, "discount_start": null, "discount_end": "2026-12-01" }
```

### `POST /api/admin/upload`
`multipart/form-data` with a single field `image`. Accepts PNG, JPEG, WEBP or GIF up to **5 MB**. Store the file under a random name.
**201** → `{ "url": "/uploads/<file>" }` · **400** for a bad type or size. The frontend saves this URL as the product's `image`.

### Categories

| Method & path | Body | Result |
|---|---|---|
| `POST /api/admin/categories` | `{ "name": "..." }` | **201** `Category` · **409** if the name exists (not case-sensitive) |
| `DELETE /api/admin/categories/:id` | — | **204**; its products stay, with `category_id = null` |

(The admin panel reads the list from the public `GET /api/categories`.)

### Orders

| Method & path | Body | Result |
|---|---|---|
| `GET /api/admin/orders?status=<status>` | — | `Order[]` with items, newest first; `status` is optional |
| `PATCH /api/admin/orders/:id` | `{ "status": "confirmed" }` | updated `Order` · 400 invalid status · 404 |

The kitchen rail moves orders forward one stage at a time (`pending → confirmed → preparing → delivering → completed`) and can cancel while an order is pending or confirmed. The history view can set any status, to correct mistakes. The panel polls the list about every **15 seconds**.

### Customers

`GET /api/admin/users` → all users (admins included), newest first, each with `order_count` and `spent` (the total of non-cancelled orders):
```json
[ { "id": 3, "name": "...", "username": "...", "phone": "...", "address": "...", "role": "customer", "created_at": "...", "order_count": 4, "spent": 2350000 } ]
```

### Restaurant settings

`PUT /api/admin/settings` with any subset of the setting keys. It returns the full settings object.
- Convert digits in `phone` and `card_number`.
- `instagram` and `telegram` are stored as bare handles: strip a leading `@` or a full profile URL.
- Values are cut to 500 characters.

---

## 7. Seeding

On first start with an empty database, create:
- **one admin account.** The username comes from `ADMIN_USERNAME` (default `admin`) and the password from `ADMIN_PASSWORD` (the default is in the README; it must be changed in production).
- **the starter menu:** 4 categories and 7 products with placeholder Toman prices.

---

# Part 2 — APIs still needed before launch

These are **not built yet**. The current UI either works around them or marks them as open in PRODUCT.md. They're listed by priority.

### P1 — Online payment (Iranian gateway, e.g. Zarinpal)
Today orders are pay-on-delivery or card-to-card.
- `POST /api/orders/:id/pay` 🔒 customer → creates a payment request with the gateway and returns `{ "redirectUrl": "..." }`.
- `GET /api/payments/callback?Authority=...&Status=...` (called by the gateway) → verifies the payment with the gateway's server API, marks the order `paid`, and redirects to `/account?placed=<id>`.
- Add order fields `payment_status` (`unpaid` | `paid` | `failed` | `refunded`), `paid_at` and `gateway_ref`. Verify **server-to-server**; never trust the callback's query string alone. Make verification idempotent.

### P1 — Delivery fee and service area
The cart currently says "the delivery fee is announced on confirmation".
- `GET /api/delivery/quote?address=...` (or `lat`/`lng`) → `{ "deliverable": true, "fee": 50000, "etaMinutes": 40 }`.
- Store `delivery_fee` on the order and include it in `total`. Admin CRUD for zones and fees: `GET/POST/PUT/DELETE /api/admin/delivery-zones`.

### P1 — Opening hours and "kitchen closed"
- Extend settings with structured hours (per weekday), plus an admin toggle `PUT /api/admin/settings { "accepting_orders": false }`.
- `POST /api/orders` must reject orders with a Persian message while closed. `GET /api/settings` should expose `isOpen` so the call board can show it.

### P2 — Order status integrity
- Enforce allowed transitions on the server (forward one step, or cancel only from pending or confirmed; allow corrections only with an explicit `force` flag from history) and record each change in an `order_status_log` table (`order_id`, `from`, `to`, `admin_id`, `at`).

### P2 — Real-time updates (replace polling)
- `GET /api/orders/stream` 🔒 customer and `GET /api/admin/orders/stream` 🔒 admin, as Server-Sent Events. Push `order.created` and `order.status` events, so the kitchen rail and the customer's lamps update instantly instead of every 15–20 seconds.

### P2 — Notifications
- SMS to the customer on `confirmed` and `delivering` (e.g. through an Iranian SMS provider such as Kavenegar), and an alert to staff on each new order. The order's `phone` is already stored in ASCII digits.

### P2 — Account recovery
- `POST /api/auth/password-reset/request { "phone" }` → sends a one-time code by SMS.
- `POST /api/auth/password-reset/confirm { "phone", "code", "newPassword" }`.
- Codes expire after 5 minutes, with at most 5 attempts.

### P2 — Security hardening
- Rate-limit `/api/auth/login`, `/api/admin/login` and `/api/auth/register` (e.g. 10 requests per minute per IP), and lock out after repeated failures.
- Admin user management: `POST /api/admin/admins` (create another staff account) and `DELETE /api/admin/admins/:id`, so the owner doesn't share one login.
- Pagination for list endpoints once data grows: `?page=&limit=` on `/api/admin/orders`, `/api/admin/users` and `/api/orders/mine`.

### P3 — Nice to have
- Product variants or extras (spice level, extra sauce): an `options` table and option ids on order items.
- Coupon codes: `POST /api/cart/validate-coupon` and admin CRUD.
- Image processing on upload (resize to 600×600, WEBP) so phones download less.
- Sales report export: `GET /api/admin/reports/sales?from=&to=` (CSV).

---

## 8. Reference implementation map

| Area | File |
|---|---|
| App, route mounting | `server/index.js` |
| Schema, migration, transactions | `server/db.js` |
| Discount and price calculation | `server/pricing.js` |
| JWT, scopes, guards | `server/auth.js` |
| Customer auth | `server/routes/auth.js` |
| Public catalog | `server/routes/catalog.js` |
| Customer orders | `server/routes/orders.js` |
| Admin API | `server/routes/admin.js` |
| Restaurant settings | `server/routes/settings.js` |
| Digit conversion | `server/text.js` |
| Seed data | `server/seed.js` |
| Frontend API client (token per panel, 401 handling) | `client/src/lib/api.js` |
