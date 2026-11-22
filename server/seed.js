import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';
import { db, tx } from './db.js';

const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&q=80`;

const CATEGORIES = ['مرغ سوخاری', 'کمبو', 'برگر', 'پیش‌غذا'];

// Starter menu. Names follow the design; PRICES ARE PLACEHOLDERS (Toman) for the owner to replace in Admin → Products.
const PRODUCTS = [
  { name: 'سوخاری ویژه', category: 'مرغ سوخاری', price: 420000, discount: 0, featured: 1,
    description: 'مرغ سوخاری ترد با ادویهٔ مخصوص؛ بیرون ترد، درون آبدار.', image: img('1626645738196-c2a7c87a8f58') },
  { name: 'فیلهٔ سوخاری', category: 'مرغ سوخاری', price: 380000, discount: 10, featured: 1,
    description: 'فیلهٔ مرغ سوخاری با سس تند و شیرین.', image: img('1599921841143-819065a55cc6') },
  { name: 'کمبو اقتصادی', category: 'کمبو', price: 690000, discount: 20, featured: 1,
    description: 'مرغ سوخاری، برگر و سیب‌زمینی سرخ‌کرده با هم.', image: img('1594212699903-ec8a3eca50f5') },
  { name: 'سیب‌زمینی سرخ‌کرده', category: 'پیش‌غذا', price: 120000, discount: 0, featured: 1,
    description: 'سیب‌زمینی ترد با نمک.', image: img('1630384060421-cb20d0e0649d') },
  { name: 'برگر', category: 'برگر', price: 350000, discount: 0, featured: 1,
    description: 'برگر گوشت با پنیر، کاهو و گوجهٔ تازه.', image: img('1568901346375-23c9450c58cd') },
  { name: 'بال سوخاری', category: 'مرغ سوخاری', price: 300000, discount: 0, featured: 0,
    description: 'بال مرغ سوخاری تند.', image: img('1637273484026-11d51fb64024') },
  { name: 'ناگت مرغ', category: 'پیش‌غذا', price: 220000, discount: 15, featured: 0,
    description: 'ناگت مرغ ترد، مناسب برای میان‌وعده.', image: img('1619881590738-a111d176d906') },
];

export function seed() {
  tx(() => {
    const catId = {};
    for (const name of CATEGORIES) {
      db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)').run(name);
      catId[name] = db.prepare('SELECT id FROM categories WHERE name = ?').get(name).id;
    }
    const ins = db.prepare(
      `INSERT INTO products (name, description, price, image, category_id, discount_percent, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const p of PRODUCTS) ins.run(p.name, p.description, p.price, p.image, catId[p.category], p.discount, p.featured);
  });
}

/** Creates the first admin (from ADMIN_USERNAME / ADMIN_PASSWORD) and the starter menu on an empty database. */
export function ensureSeed() {
  const hasAdmin = db.prepare("SELECT 1 FROM users WHERE role = 'admin'").get();
  if (!hasAdmin) {
    const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    db.prepare("INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, 'admin')").run(
      'مدیر',
      username,
      bcrypt.hashSync(password, 10),
    );
    console.log(`Created admin account "${username}" (password from ADMIN_PASSWORD or the README default).`);
  }
  const hasProducts = db.prepare('SELECT 1 FROM products').get();
  if (!hasProducts) {
    seed();
    console.log('Seeded starter menu.');
  }
}

// `npm run seed` runs this file directly.
if (import.meta.url === pathToFileURL(process.argv[1]).href) ensureSeed();
