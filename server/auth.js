import jwt from 'jsonwebtoken';
import { db, getJwtSecret } from './db.js';

const SECRET = getJwtSecret();

// The customer panel and the admin panel have separate sessions. Every token names its panel
// ("customer" or "admin") and is only accepted by that panel's API.
export function signToken(user, scope) {
  return jwt.sign({ sub: user.id, role: user.role, scope }, SECRET, { expiresIn: scope === 'admin' ? '12h' : '30d' });
}

export function publicUser(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

function guard(scope) {
  return (req, res, next) => {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'لطفاً وارد حساب خود شوید' });
    let payload;
    try {
      payload = jwt.verify(token, SECRET);
    } catch {
      return res.status(401).json({ error: 'نشست شما منقضی شده؛ دوباره وارد شوید' });
    }
    if (payload.scope !== scope) return res.status(401).json({ error: 'لطفاً وارد حساب خود شوید' });
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    if (!user) return res.status(401).json({ error: 'حساب کاربری پیدا نشد' });
    if (scope === 'admin' && user.role !== 'admin') return res.status(403).json({ error: 'فقط مدیران دسترسی دارند' });
    if (scope === 'customer' && user.role !== 'customer') return res.status(401).json({ error: 'لطفاً وارد حساب خود شوید' });
    req.user = user;
    next();
  };
}

/** Customer panel API (orders, profile). */
export const requireAuth = guard('customer');
/** Admin panel API. */
export const requireAdmin = guard('admin');
