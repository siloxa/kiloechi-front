import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, UPLOAD_DIR } from './db.js';
import { ensureSeed } from './seed.js';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js';

ensureSeed();

const app = express();
app.use(express.json({ limit: '1mb' }));

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));
app.use('/api', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', catalogRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'پیدا نشد' }));

// In production, serve the built React app.
const dist = path.join(ROOT, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'خطای سرور' });
});

// In dev (`--dev`) the API always sits on 3001 behind Vite's proxy; in production PORT is honoured.
const PORT = process.argv.includes('--dev') ? 3001 : Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
