import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { formatNumber } from '../lib/format.js';
import SlipRow from '../components/ProductCard.jsx';
import { FlameIcon } from '../components/Icons.jsx';

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const category = params.get('category') || '';
  const promo = params.get('promo') === '1';
  const q = params.get('q') || '';

  useEffect(() => {
    api('/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (promo) qs.set('promo', '1');
    if (q) qs.set('q', q);
    setProducts(null);
    setError('');
    api(`/products?${qs}`).then(setProducts).catch((e) => setError(e.message));
  }, [category, promo, q]);

  const setFilter = (next) => {
    const p = new URLSearchParams();
    if (next.category) p.set('category', next.category);
    if (next.promo) p.set('promo', '1');
    if (next.q) p.set('q', next.q);
    setParams(p);
  };

  // One slip per category, in the order the categories were created.
  const groups = useMemo(() => {
    const m = new Map();
    for (const p of products || []) {
      const k = p.category || 'سایر';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(p);
    }
    return [...m.entries()];
  }, [products]);

  return (
    <section className="page container">
      <h1 className="page__title">{promo ? 'تخفیف‌های امروز' : q ? `جستجو: «${q}»` : 'منو'}</h1>

      <div className="tabs" role="group" aria-label="فیلتر منو">
        <button className={`tab ${!category && !promo ? 'is-on' : ''}`} aria-pressed={!category && !promo} onClick={() => setFilter({ q })}>همه</button>
        <button className={`tab ${promo ? 'is-on' : ''}`} aria-pressed={promo} onClick={() => setFilter({ category, q, promo: !promo })}>
          <FlameIcon width={18} height={18} /> تخفیف‌دار
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`tab ${String(c.id) === category ? 'is-on' : ''}`}
            aria-pressed={String(c.id) === category}
            onClick={() => setFilter({ category: String(c.id) === category ? '' : String(c.id), promo, q })}
          >
            {c.name}
          </button>
        ))}
        {q && <button className="tab" onClick={() => setFilter({ category, promo })}>پاک کردن جستجو</button>}
      </div>

      {error && <p className="empty">{error}</p>}
      {!products && !error && <p className="page-loading">در حال چاپ منو…</p>}
      {products && products.length === 0 && <p className="empty">چیزی پیدا نشد. فیلتر دیگری را امتحان کنید.</p>}
      <div className="slips">
        {groups.map(([name, items]) => (
          <section key={name} className="slip" aria-label={name}>
            <div className="slip__head">
              <h2 className="slip__title">{name}</h2>
              <span className="slip__meta">{formatNumber(items.length)} قلم</span>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map((p) => <SlipRow key={p.id} product={p} />)}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
