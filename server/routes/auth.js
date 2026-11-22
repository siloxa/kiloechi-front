import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, USERNAME_RE } from '../db.js';
import { latinDigits } from '../text.js';
import { signToken, publicUser, requireAuth } from '../auth.js';

const r = Router();
// Usernames are case-insensitive; Persian digits typed on a phone keyboard are accepted.
export const cleanUsername = (v) => latinDigits(v).trim().toLowerCase();

/** Returns the user for a correct username + password, otherwise null. */
export function checkCredentials(body) {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername(body.username));
  if (!user || !bcrypt.compareSync(String(body.password || ''), user.password_hash)) return null;
  return user;
}

/** Shared by both panels: update name/phone/address and optionally the password. Returns an error message or null. */
export function updateProfile(user, body) {
  const name = String(body.name ?? user.name).trim();
  const phone = latinDigits(body.phone ?? user.phone).trim();
  const address = String(body.address ?? user.address ?? '').trim();
  if (!name) return 'نام را وارد کنید';
  if (body.newPassword) {
    if (!bcrypt.compareSync(String(body.currentPassword || ''), user.password_hash)) return 'رمز عبور فعلی اشتباه است';
    if (String(body.newPassword).length < 6) return 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد';
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(String(body.newPassword), 10), user.id);
  }
  db.prepare('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?').run(name, phone, address, user.id);
  return null;
}

r.post('/register', (req, res) => {
  const name = String(req.body.name || '').trim();
  const username = cleanUsername(req.body.username);
  const password = String(req.body.password || '');
  const phone = latinDigits(req.body.phone).trim();
  if (!name) return res.status(400).json({ error: 'نام را وارد کنید' });
  if (!USERNAME_RE.test(username))
    return res.status(400).json({ error: 'نام کاربری باید ۳ تا ۳۰ حرف انگلیسی، عدد، نقطه یا زیرخط باشد' });
  if (password.length < 6) return res.status(400).json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' });
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username))
    return res.status(409).json({ error: 'این نام کاربری قبلاً گرفته شده است' });

  const hash = bcrypt.hashSync(password, 10);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (name, username, password_hash, phone) VALUES (?, ?, ?, ?)')
    .run(name, username, hash, phone);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);
  res.status(201).json({ token: signToken(user, 'customer'), user: publicUser(user) });
});

// Customer login only. Admin accounts sign in on the separate admin panel (/admin/login).
r.post('/login', (req, res) => {
  const user = checkCredentials(req.body);
  if (!user) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
  if (user.role !== 'customer')
    return res.status(403).json({ error: 'این حساب مدیر است؛ از صفحهٔ ورود پنل مدیریت وارد شوید' });
  res.json({ token: signToken(user, 'customer'), user: publicUser(user) });
});

r.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

r.put('/me', requireAuth, (req, res) => {
  const error = updateProfile(req.user, req.body);
  if (error) return res.status(400).json({ error });
  res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)) });
});

export default r;
