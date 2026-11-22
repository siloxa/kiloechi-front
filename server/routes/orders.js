import { Router } from 'express';
import { db, tx } from '../db.js';
import { requireAuth } from '../auth.js';
import { withPricing } from '../pricing.js';
import { latinDigits } from '../text.js';

const r = Router();
r.use(requireAuth);

export function loadOrder(id) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return null;
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  return order;
}

// Prices are always recomputed here from the DB; the client only sends product ids and quantities.
r.post('/', (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const customer_name = String(req.body.name || req.user.name || '').trim();
  const phone = latinDigits(req.body.phone).trim();
  const address = String(req.body.address || '').trim();
  const note = String(req.body.note || '').trim().slice(0, 500);
  const payment_method = ['cod', 'transfer'].includes(req.body.payment_method) ? req.body.payment_method : 'cod';

  if (!items.length) return res.status(400).json({ error: 'سبد خرید شما خالی است' });
  if (!customer_name || !phone || !address)
    return res.status(400).json({ error: 'نام، شماره تماس و نشانی تحویل لازم است' });

  const lines = [];
  for (const it of items) {
    const qty = Math.floor(Number(it.quantity));
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) return res.status(400).json({ error: 'تعداد نامعتبر است' });
    const row = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(it.productId);
    if (!row) return res.status(400).json({ error: 'یکی از محصولات سبد شما دیگر موجود نیست' });
    lines.push({ p: withPricing(row), qty });
  }

  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const total = lines.reduce((s, l) => s + l.p.final_price * l.qty, 0);

  const id = tx(() => {
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO orders (user_id, subtotal, discount_total, total, customer_name, phone, address, note, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(req.user.id, subtotal, subtotal - total, total, customer_name, phone, address, note, payment_method);
    const ins = db.prepare(
      `INSERT INTO order_items (order_id, product_id, name, image, unit_price, final_price, discount_percent, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const { p, qty } of lines)
      ins.run(lastInsertRowid, p.id, p.name, p.image || '', p.price, p.final_price, p.effective_discount, qty);
    // Remember contact details for next time.
    db.prepare('UPDATE users SET phone = ?, address = ? WHERE id = ?').run(phone, address, req.user.id);
    return lastInsertRowid;
  });

  res.status(201).json(loadOrder(id));
});

r.get('/mine', (req, res) => {
  const ids = db.prepare('SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  res.json(ids.map((o) => loadOrder(o.id)));
});

r.post('/:id/cancel', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'سفارش پیدا نشد' });
  if (order.status !== 'pending') return res.status(400).json({ error: 'فقط سفارش‌های در انتظار تأیید قابل لغو هستند' });
  db.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").run(order.id);
  res.json(loadOrder(order.id));
});

export default r;
