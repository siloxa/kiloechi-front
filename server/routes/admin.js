import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { db, UPLOAD_DIR } from '../db.js';
import { requireAdmin, publicUser, signToken } from '../auth.js';
import { checkCredentials, updateProfile } from './auth.js';
import { withPricing } from '../pricing.js';
import { loadOrder } from './orders.js';

const r = Router();

// Admin login: separate from the customer login, and only admin accounts may use it.
r.post('/login', (req, res) => {
  const user = checkCredentials(req.body);
  if (!user || user.role !== 'admin') return res.status(401).json({ error: 'نام کاربری یا رمز عبور مدیر اشتباه است' });
  res.json({ token: signToken(user, 'admin'), user: publicUser(user) });
});

r.use(requireAdmin);

r.get('/me', (req, res) => res.json({ user: publicUser(req.user) }));
r.put('/me', (req, res) => {
  const error = updateProfile(req.user, req.body);
  if (error) return res.status(400).json({ error });
  res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)) });
});

const STATUSES = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------- image upload ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)),
});

r.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'یک تصویر PNG، JPG، WEBP یا GIF تا ۵ مگابایت بارگذاری کنید' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// ---------- dashboard ----------
r.get('/stats', (_req, res) => {
  const one = (sql) => db.prepare(sql).get().v;
  res.json({
    revenue: one("SELECT COALESCE(SUM(total),0) v FROM orders WHERE status != 'cancelled'"),
    revenueToday: one(
      "SELECT COALESCE(SUM(total),0) v FROM orders WHERE status != 'cancelled' AND date(created_at,'localtime') = date('now','localtime')",
    ),
    orders: one('SELECT COUNT(*) v FROM orders'),
    openOrders: one("SELECT COUNT(*) v FROM orders WHERE status IN ('pending','confirmed','preparing','delivering')"),
    customers: one("SELECT COUNT(*) v FROM users WHERE role = 'customer'"),
    products: one('SELECT COUNT(*) v FROM products'),
    onPromo: db.prepare('SELECT * FROM products').all().map((p) => withPricing(p)).filter((p) => p.discount_active).length,
    topProducts: db
      .prepare(
        `SELECT oi.name, SUM(oi.quantity) qty, SUM(oi.final_price * oi.quantity) revenue
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'cancelled' GROUP BY oi.name ORDER BY qty DESC LIMIT 5`,
      )
      .all(),
    recentOrders: db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 6').all(),
  });
});

// ---------- products ----------
function checkDiscount(pct, start, end) {
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) return 'تخفیف باید بین ۰ تا ۱۰۰ درصد باشد';
  if ((start && !DATE_RE.test(start)) || (end && !DATE_RE.test(end))) return 'تاریخ تخفیف نامعتبر است';
  if (start && end && start > end) return 'تاریخ پایان تخفیف قبل از تاریخ شروع است';
  return null;
}

function readProduct(body) {
  const name = String(body.name || '').trim();
  const price = Math.round(Number(body.price));
  const discount = Math.round(Number(body.discount_percent || 0));
  const start = body.discount_start || null;
  const end = body.discount_end || null;
  if (!name) return { error: 'نام را وارد کنید' };
  if (!Number.isFinite(price) || price < 0) return { error: 'قیمت باید عددی مثبت باشد' };
  const dErr = checkDiscount(discount, start, end);
  if (dErr) return { error: dErr };
  return {
    value: {
      name,
      description: String(body.description || '').trim(),
      price,
      image: String(body.image || '').trim(),
      category_id: body.category_id ? Number(body.category_id) : null,
      discount_percent: discount,
      discount_start: discount ? start : null,
      discount_end: discount ? end : null,
      is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
      is_featured: body.is_featured ? 1 : 0,
    },
  };
}

const PRODUCT_SQL = `SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON c.id = p.category_id`;
const getProduct = (id) => {
  const p = db.prepare(`${PRODUCT_SQL} WHERE p.id = ?`).get(id);
  return p && withPricing(p);
};

r.get('/products', (_req, res) => {
  res.json(db.prepare(`${PRODUCT_SQL} ORDER BY p.id DESC`).all().map((p) => withPricing(p)));
});

r.get('/products/:id', (req, res) => {
  const p = getProduct(req.params.id);
  if (!p) return res.status(404).json({ error: 'محصول پیدا نشد' });
  res.json(p);
});

r.post('/products', (req, res) => {
  const { error, value: v } = readProduct(req.body);
  if (error) return res.status(400).json({ error });
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO products (name, description, price, image, category_id, discount_percent, discount_start, discount_end, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(v.name, v.description, v.price, v.image, v.category_id, v.discount_percent, v.discount_start, v.discount_end, v.is_active, v.is_featured);
  res.status(201).json(getProduct(lastInsertRowid));
});

// Bulk discount: apply one discount (or clear it with 0) to many products at once.
r.post('/products/bulk-discount', (req, res) => {
  const ids = (Array.isArray(req.body.ids) ? req.body.ids : []).map(Number).filter(Number.isInteger);
  const pct = Math.round(Number(req.body.discount_percent || 0));
  const start = req.body.discount_start || null;
  const end = req.body.discount_end || null;
  if (!ids.length) return res.status(400).json({ error: 'حداقل یک محصول را انتخاب کنید' });
  const dErr = checkDiscount(pct, start, end);
  if (dErr) return res.status(400).json({ error: dErr });
  const stmt = db.prepare('UPDATE products SET discount_percent=?, discount_start=?, discount_end=? WHERE id=?');
  for (const id of ids) stmt.run(pct, pct ? start : null, pct ? end : null, id);
  res.json({ updated: ids.length });
});

r.put('/products/:id', (req, res) => {
  if (!db.prepare('SELECT 1 FROM products WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'محصول پیدا نشد' });
  const { error, value: v } = readProduct(req.body);
  if (error) return res.status(400).json({ error });
  db.prepare(
    `UPDATE products SET name=?, description=?, price=?, image=?, category_id=?, discount_percent=?, discount_start=?, discount_end=?, is_active=?, is_featured=? WHERE id=?`,
  ).run(v.name, v.description, v.price, v.image, v.category_id, v.discount_percent, v.discount_start, v.discount_end, v.is_active, v.is_featured, req.params.id);
  res.json(getProduct(req.params.id));
});

r.delete('/products/:id', (req, res) => {
  const { changes } = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (!changes) return res.status(404).json({ error: 'محصول پیدا نشد' });
  res.status(204).end();
});

// ---------- categories ----------
r.post('/categories', (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'نام را وارد کنید' });
  if (db.prepare('SELECT 1 FROM categories WHERE name = ?').get(name))
    return res.status(409).json({ error: 'این دسته‌بندی از قبل وجود دارد' });
  const { lastInsertRowid } = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
  res.status(201).json({ id: Number(lastInsertRowid), name });
});

r.delete('/categories/:id', (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ---------- orders ----------
r.get('/orders', (req, res) => {
  const { status } = req.query;
  const rows = status
    ? db.prepare('SELECT id FROM orders WHERE status = ? ORDER BY id DESC').all(status)
    : db.prepare('SELECT id FROM orders ORDER BY id DESC').all();
  res.json(rows.map((o) => loadOrder(o.id)));
});

r.patch('/orders/:id', (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'وضعیت نامعتبر است' });
  const { changes } = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  if (!changes) return res.status(404).json({ error: 'سفارش پیدا نشد' });
  res.json(loadOrder(req.params.id));
});

// ---------- customers ----------
r.get('/users', (_req, res) => {
  const users = db
    .prepare(
      `SELECT u.*, COUNT(o.id) AS order_count,
              COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total END), 0) AS spent
       FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id ORDER BY u.id DESC`,
    )
    .all();
  res.json(users.map(publicUser));
});

export default r;
