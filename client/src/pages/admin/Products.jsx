import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatDay, formatMoney, formatNumber } from '../../lib/format.js';
import { DrumstickIcon } from '../../components/Icons.jsx';

function discountLabel(p) {
  if (!p.discount_percent) return <span className="muted">—</span>;
  const range = [formatDay(p.discount_start), formatDay(p.discount_end)].filter(Boolean).join(' تا ');
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time
  const state = p.discount_active
    ? 'فعال'
    : p.discount_start && p.discount_start > today
      ? `از ${formatDay(p.discount_start)}`
      : 'تمام‌شده';
  return (
    <span className={`dtag ${p.discount_active ? 'is-live' : 'is-off'}`} title={range || 'بدون تاریخ پایان'}>
      {formatNumber(p.discount_percent)}٪ · {state}
    </span>
  );
}

function BulkDiscount({ ids, onDone }) {
  const [pct, setPct] = useState(10);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');

  const apply = async (value) => {
    setError('');
    try {
      await api('/admin/products/bulk-discount', {
        method: 'POST',
        body: { ids, discount_percent: value, discount_start: start || null, discount_end: end || null },
      });
      onDone();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="bulkbar card">
      <strong>{formatNumber(ids.length)} محصول انتخاب شده</strong>
      <label>درصد تخفیف<input type="number" min={1} max={100} value={pct} onChange={(e) => setPct(e.target.value)} /></label>
      <label>از تاریخ<input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
      <label>تا تاریخ<input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
      <button className="btn btn--red" onClick={() => apply(Number(pct))}>اعمال تخفیف</button>
      <button className="btn btn--ghost" onClick={() => apply(0)}>حذف تخفیف</button>
      {error && <span className="error" role="alert">{error}</span>}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(new Set());

  const load = () => api('/admin/products').then(setProducts).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(
    () => (products || []).filter((p) => `${p.name} ${p.category || ''}`.toLowerCase().includes(q.toLowerCase())),
    [products, q],
  );

  const toggle = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const allOn = shown.length > 0 && shown.every((p) => selected.has(p.id));
  const toggleAll = () => setSelected(allOn ? new Set() : new Set(shown.map((p) => p.id)));

  const quickUpdate = async (p, patch) => {
    try {
      await api(`/admin/products/${p.id}`, { method: 'PUT', body: { ...p, ...patch } });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const del = async (p) => {
    if (!confirm(`«${p.name}» حذف شود؟ سفارش‌های قبلی نسخهٔ خودشان را نگه می‌دارند.`)) return;
    await api(`/admin/products/${p.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <div className="admin__head">
        <h1>محصولات و تخفیف‌ها</h1>
        <div className="row">
          <input className="search" placeholder="جستجوی محصول…" aria-label="جستجوی محصول" value={q} onChange={(e) => setQ(e.target.value)} />
          <Link to="/admin/products/new" className="btn btn--red">افزودن محصول</Link>
        </div>
      </div>

      {selected.size > 0 && (
        <BulkDiscount
          ids={[...selected]}
          onDone={() => {
            setSelected(new Set());
            load();
          }}
        />
      )}

      {error && <p className="error">{error}</p>}
      {!products && !error && <p className="muted">در حال بارگذاری…</p>}
      {products && (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="انتخاب همه" /></th>
                <th>محصول</th>
                <th>دسته</th>
                <th>قیمت</th>
                <th>تخفیف</th>
                <th>قیمت نهایی</th>
                <th>نمایش</th>
                <th>ویژه</th>
                <th><span className="sr-only">عملیات</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} className={p.is_active ? '' : 'is-dim'}>
                  <td><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`انتخاب ${p.name}`} /></td>
                  <td>
                    <div className="prodcell">
                      {p.image ? <img src={p.image} alt="" width="44" height="44" /> : <span className="prodcell__ph"><DrumstickIcon width={20} /></span>}
                      <Link to={`/admin/products/${p.id}`}>{p.name}</Link>
                    </div>
                  </td>
                  <td>{p.category || <span className="muted">—</span>}</td>
                  <td>{formatMoney(p.price)}</td>
                  <td>{discountLabel(p)}</td>
                  <td><strong>{formatMoney(p.final_price)}</strong></td>
                  <td><input type="checkbox" className="switch" checked={p.is_active} onChange={() => quickUpdate(p, { is_active: !p.is_active })} aria-label={`نمایش ${p.name} در سایت`} /></td>
                  <td><input type="checkbox" className="switch" checked={p.is_featured} onChange={() => quickUpdate(p, { is_featured: !p.is_featured })} aria-label={`${p.name} در صفحهٔ اول`} /></td>
                  <td className="actions">
                    <Link to={`/admin/products/${p.id}`} className="btn btn--sm btn--ghost">ویرایش</Link>
                    <button className="btn btn--sm btn--danger" onClick={() => del(p)}>حذف</button>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={9} className="muted center">محصولی پیدا نشد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted small">برای اعمال یا حذف تخفیف روی چند محصول، آن‌ها را تیک بزنید.</p>
    </>
  );
}
