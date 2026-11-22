# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Customers in Iran** ordering fried chicken, burgers and sides online for delivery, mostly from their phones. They read Persian, pay in Toman, and expect right-to-left layout.
- **Restaurant staff (admin)** who manage the menu, prices and discounts, and move orders through their statuses during service.

## Product Purpose

Online menu and ordering for Kiloechi, a real fried-chicken restaurant. Customers browse the menu, see current discounts, order, and follow their order's status. Staff run the menu and handle incoming orders from the admin panel. Success means orders come in without phone calls, and staff can change prices or promos in seconds.

## Positioning

Kiloechi wants to be remembered for **crispy taste**: the quality and flavor of its fried chicken. Value deals (combos, discounts) support this but are not the headline.

## Operating Context

- Orders are delivery orders. Payment happens on delivery (cash or card reader) or by card-to-card transfer after staff confirm. There is no online payment gateway yet.
- Staff update the order status (pending → confirmed → preparing → on the way → completed). Customers see it on their account page, which refreshes on its own.
- Discounts are per-product percentages, optionally limited to a date range, and can be applied to several products at once.

## Capabilities and Constraints

- Language: Persian (fa) only, `dir="rtl"`. Numbers and dates shown with Persian digits, dates in the Solar Hijri calendar.
- Currency: Toman, stored as whole numbers.
- Stack (existing): React + Vite client, Express + node:sqlite API, JWT auth. See README.md.
- **Open decisions:** online payment gateway (e.g. Zarinpal), delivery fee and zones, opening hours.

## Brand Commitments

- Visual identity comes from the Figma "Simple Fried Chicken Website" design the owner chose: red and yellow, a bold display headline, the "Menu" pill, yellow product cards with red name labels, the orange sunburst combo banner, and the red footer.
- The name "Kiloechi" stays in Latin letters in the logo until the owner gives a Persian wordmark.

## Evidence on Hand

- Product photos: starter Unsplash images only. The owner will replace them with real photos through the admin panel.
- **Not available, must not be invented:** customer testimonials, the restaurant's address, phone number, branches, social media accounts, and real prices. Address, phone and social links come from the admin Settings page and stay hidden until filled in. The starter menu prices are placeholders for the owner to replace.

## Product Principles

1. Food first: big, appetizing product photos carry the page.
2. Ordering is never more than two taps from any menu item.
3. Staff screens favor speed and clarity during a busy service over decoration.
4. Show only true information: no fake reviews, branches or claims.

## Accessibility & Inclusion

Persian right-to-left throughout, readable on low-end Android phones, touch targets at least 44px, WCAG AA contrast.
