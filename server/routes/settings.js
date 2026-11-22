import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';
import { latinDigits } from '../text.js';

// Restaurant details shown on the site. Everything starts empty and stays hidden until the owner fills it in,
// so the site never shows an invented address, phone or social account.
export const SETTING_KEYS = ['address', 'phone', 'hours', 'instagram', 'telegram', 'card_number', 'card_holder'];

export function getSettings() {
  const out = Object.fromEntries(SETTING_KEYS.map((k) => [k, '']));
  for (const row of db.prepare('SELECT key, value FROM settings').all()) if (row.key in out) out[row.key] = row.value;
  return out;
}

const r = Router();

r.get('/settings', (_req, res) => res.json(getSettings()));

r.put('/admin/settings', requireAdmin, (req, res) => {
  const stmt = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  );
  for (const key of SETTING_KEYS) {
    if (!(key in req.body)) continue;
    let value = String(req.body[key] ?? '').trim().slice(0, 500);
    if (key === 'phone' || key === 'card_number') value = latinDigits(value);
    if (key === 'instagram' || key === 'telegram') value = value.replace(/^@/, '').replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '');
    stmt.run(key, value);
  }
  res.json(getSettings());
});

export default r;
