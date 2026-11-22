import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatDate, formatMoney, formatNumber } from '../../lib/format.js';
import { StatusBadge } from '../account/Account.jsx';

/** One LED readout on the board strip. */
function Readout({ label, value, unit, to }) {
  const body = (
    <>
      <span className="readout__label">{label}</span>
      <span className="led">{value}</span>
      {unit && <span className="readout__unit">{unit}</span>}
    </>
  );
  return to ? <Link to={to} className="readout">{body}</Link> : <div className="readout">{body}</div>;
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = () => api('/admin/stats').then(setS).catch((e) => setError(e.message));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!s) return <p className="muted">در حال بارگذاری…</p>;

  const maxQty = Math.max(1, ...s.topProducts.map((p) => p.qty));

  return (
    <>
      <div className="admin__head">
        <h1>داشبورد</h1>
        <Link to="/admin/products/new" className="btn btn--red">افزودن محصول</Link>
      </div>
      <div className="readouts">
        <Readout label="سفارش‌های باز" value={formatNumber(s.openOrders)} unit="روی ریل سفارش‌ها" to="/admin/orders" />
        <Readout label="فروش امروز" value={formatNumber(s.revenueToday)} unit="تومان" />
        <Readout label="کل فروش" value={formatNumber(s.revenue)} unit="تومان" />
        <Readout label="همهٔ سفارش‌ها" value={formatNumber(s.orders)} to="/admin/orders" />
        <Readout label="مشتریان" value={formatNumber(s.customers)} to="/admin/customers" />
        <Readout label="تخفیف‌دار" value={`${formatNumber(s.onPromo)}/${formatNumber(s.products)}`} unit="محصول" to="/admin/products" />
      </div>

      <div className="admin__grid2">
        <section className="card">
          <h2>آخرین سفارش‌ها</h2>
          {s.recentOrders.length === 0 ? (
            <p className="muted">هنوز سفارشی نیامده است.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>#</th><th>مشتری</th><th>مبلغ</th><th>وضعیت</th><th>زمان</th></tr></thead>
                <tbody>
                  {s.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{formatNumber(o.id)}</td>
                      <td>{o.customer_name}</td>
                      <td>{formatMoney(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="muted small">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="card">
          <h2>پرفروش‌ها</h2>
          {s.topProducts.length === 0 ? (
            <p className="muted">با اولین فروش‌ها این بخش پر می‌شود.</p>
          ) : (
            <ul className="bars">
              {s.topProducts.map((p) => (
                <li key={p.name}>
                  <div className="bars__label"><span>{p.name}</span><span className="muted">{formatNumber(p.qty)} عدد</span></div>
                  <div className="bars__track"><div className="bars__fill" style={{ width: `${(p.qty / maxQty) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
