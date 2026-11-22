import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { formatNumber } from '../lib/format.js';
import SlipRow from '../components/ProductCard.jsx';
import { Lamps } from './account/Account.jsx';

// Starter photo until the restaurant's own photos are uploaded (Unsplash; replace in Admin → Products).
const HERO_IMG = 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=1400&h=875&fit=crop&q=80';

const today = () => new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' });

/** The board's own status lamps, lit one after another when they scroll into view: how an order travels. */
function Journey() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setOn(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="band" aria-labelledby="journey-title" ref={ref}>
      <div className={`container journey ${on ? 'is-on' : ''}`}>
        <div>
          <h2 id="journey-title">از فیش تا در خانه</h2>
          <p>بعد از ثبت سفارش، شماره‌ات روی همین تابلو چراغ به چراغ جلو می‌رود.</p>
        </div>
        <Lamps status="pending" demo />
      </div>
    </section>
  );
}

function CategorySlip({ title, products, to }) {
  return (
    <section className="slip" aria-label={title}>
      <div className="slip__head">
        <h3 className="slip__title">{title}</h3>
        <span className="slip__meta">{formatNumber(products.length)} قلم</span>
      </div>
      <ul className="srows" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {products.slice(0, 4).map((p) => <SlipRow key={p.id} product={p} />)}
      </ul>
      {to && products.length > 4 && (
        <div className="slip__foot"><Link to={to} className="btn btn--line btn--sm">همهٔ {title}</Link></div>
      )}
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/products').then(setProducts).catch((e) => setError(e.message));
  }, []);

  const featured = useMemo(() => (products || []).filter((p) => p.is_featured), [products]);
  const deals = useMemo(() => (products || []).filter((p) => p.discount_active), [products]);
  const byCategory = useMemo(() => {
    const m = new Map();
    for (const p of products || []) {
      const k = p.category || 'سایر';
      if (!m.has(k)) m.set(k, { id: p.category_id, items: [] });
      m.get(k).items.push(p);
    }
    return [...m.entries()];
  }, [products]);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <h1 className="hero__title">ترد، داغ،<br />همین حالا.</h1>
            <p className="hero__lead">از فیش امروز انتخاب کن؛ شماره‌ات که روی تابلو روشن شد، سفارشت داغ در راه است.</p>
            <Link to="/menu" className="btn btn--ink btn--lg">دیدن کل منو</Link>
          </div>
          <figure className="hero__photo">
            <img src={HERO_IMG} alt="مرغ سوخاری ترد" width="1400" height="875" fetchPriority="high" />
          </figure>

          <div className="hero__ticket">
            <div className="slip__printer" aria-hidden />
            <section className="slip" aria-labelledby="today-title">
              <div className="slip__head">
                <h2 className="slip__title" id="today-title">فیش امروز</h2>
                <span className="slip__meta">{today()}</span>
              </div>
              {error && <p className="error">{error}</p>}
              {!products && !error && <p className="muted">در حال چاپ فیش…</p>}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {(featured.length ? featured : products || []).slice(0, 5).map((p) => <SlipRow key={p.id} product={p} />)}
              </ul>
              <div className="slip__foot">
                <Link to="/menu" className="btn btn--red btn--block">همهٔ منو</Link>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Journey />

      {deals.length > 0 && (
        <section className="section container" id="promo" aria-labelledby="deals-title">
          <div className="section__head">
            <h2 className="section__title" id="deals-title">تخفیف‌های امروز</h2>
            <Link to="/menu?promo=1" className="btn btn--yellow">همهٔ تخفیف‌ها</Link>
          </div>
          <section className="slip slip--wide" aria-label="تخفیف‌های امروز">
            <div className="slip__head">
              <span className="slip__meta">{today()}</span>
              <span className="slip__meta">{formatNumber(deals.length)} قلم مهر خورده</span>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {deals.map((p) => <SlipRow key={p.id} product={p} />)}
            </ul>
          </section>
        </section>
      )}

      {byCategory.length > 0 && (
        <section className="section container" aria-labelledby="menu-title" style={{ paddingTop: deals.length ? 0 : undefined }}>
          <div className="section__head">
            <h2 className="section__title" id="menu-title">منو</h2>
          </div>
          <div className="slips">
            {byCategory.map(([name, { id, items }]) => (
              <CategorySlip key={name} title={name} products={items} to={id ? `/menu?category=${id}` : '/menu'} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
