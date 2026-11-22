import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROOT = path.resolve(import.meta.dirname, '..');
export const DATA_DIR = path.join(ROOT, 'data');
export const UPLOAD_DIR = path.join(ROOT, 'uploads');
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'app.db'));
db.exec(`
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL CHECK (price >= 0),
  image TEXT DEFAULT '',
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  discount_start TEXT,
  discount_end TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','preparing','delivering','completed','cancelled')),
  subtotal INTEGER NOT NULL,
  discount_total INTEGER NOT NULL,
  total INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  name TEXT NOT NULL,
  image TEXT DEFAULT '',
  unit_price INTEGER NOT NULL,
  final_price INTEGER NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);
`);

/** Usernames: 3–30 Latin letters, digits, dot or underscore; stored lowercase. */
export const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;

// Migration: older databases identified users by email. Rebuild the table with a username
// derived from the part of the email before "@" (made unique if needed).
if (!db.prepare('PRAGMA table_info(users)').all().some((c) => c.name === 'username')) {
  db.exec('PRAGMA foreign_keys = OFF');
  tx(() => {
    db.exec(`CREATE TABLE users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    const taken = new Set();
    const ins = db.prepare(
      'INSERT INTO users_new (id, name, username, password_hash, phone, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    for (const u of db.prepare('SELECT * FROM users ORDER BY id').all()) {
      let base = String(u.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 24);
      if (base.length < 3) base = `user${u.id}`;
      let name = base;
      for (let i = 2; taken.has(name); i++) name = `${base}${i}`;
      taken.add(name);
      ins.run(u.id, u.name, name, u.password_hash, u.phone, u.address, u.role, u.created_at);
    }
    db.exec('DROP TABLE users; ALTER TABLE users_new RENAME TO users;');
  });
  db.exec('PRAGMA foreign_keys = ON');
  console.log('Migrated users from email to username login.');
}

/** JWT secret: env var, else a random one persisted in data/ so logins survive restarts. */
export function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = path.join(DATA_DIR, '.jwt-secret');
  if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(48).toString('hex'));
  return fs.readFileSync(file, 'utf8');
}

/** Wrap a function in a transaction. */
export function tx(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
