import { Router } from 'express';
import { db } from '../db.js';
import { withPricing } from '../pricing.js';

const r = Router();

const BASE = `SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

r.get('/products', (req, res) => {
  const rows = db.prepare(`${BASE} WHERE p.is_active = 1 ORDER BY p.is_featured DESC, p.id`).all();
  let list = rows.map((p) => withPricing(p));
  const { category, q, promo } = req.query;
  if (category) list = list.filter((p) => String(p.category_id) === String(category));
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(needle));
  }
  if (promo) list = list.filter((p) => p.discount_active);
  res.json(list);
});

r.get('/products/:id', (req, res) => {
  const p = db.prepare(`${BASE} WHERE p.id = ? AND p.is_active = 1`).get(req.params.id);
  if (!p) return res.status(404).json({ error: 'محصول پیدا نشد' });
  res.json(withPricing(p));
});

r.get('/categories', (_req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY name').all());
});

export default r;
