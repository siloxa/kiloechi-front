// Dates are stored as 'YYYY-MM-DD' (server local time). Start is inclusive from 00:00,
// end is inclusive until 23:59:59.
const startOf = (d) => new Date(`${d}T00:00:00`);
const endOf = (d) => new Date(`${d}T23:59:59.999`);

export function isDiscountActive(p, now = new Date()) {
  if (!p.discount_percent || p.discount_percent <= 0) return false;
  if (p.discount_start && now < startOf(p.discount_start)) return false;
  if (p.discount_end && now > endOf(p.discount_end)) return false;
  return true;
}

/** Shape a product row for the API, with the effective (discounted) price computed server-side. */
export function withPricing(p, now = new Date()) {
  const active = isDiscountActive(p, now);
  const pct = active ? p.discount_percent : 0;
  return {
    ...p,
    is_active: !!p.is_active,
    is_featured: !!p.is_featured,
    discount_active: active,
    effective_discount: pct,
    final_price: Math.round((p.price * (100 - pct)) / 100),
  };
}
