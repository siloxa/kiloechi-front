import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useCart } from '../../lib/cart.jsx';
import { PAYMENT_LABELS, STATUS_LABELS, formatDate, formatMoney, formatNumber } from '../../lib/format.js';
import { CheckIcon } from '../../components/Icons.jsx';
import { DiscountBadge } from '../../components/ProductCard.jsx';
import PasswordInput from '../../components/PasswordInput.jsx';

const STEPS = ['pending', 'confirmed', 'preparing', 'delivering', 'completed'];

export function StatusBadge({ status }) {
  return <span className={`status status--${status}`}>{STATUS_LABELS[status] || status}</span>;
}

/** Status lamps: each lamp carries its label; the current one pulses. */
export function Lamps({ status, paper = false, demo = false }) {
  const step = STEPS.indexOf(status);
  return (
    <ol className={`lamps ${paper ? 'lamps--paper' : ''}`} aria-label="مراحل سفارش">
      {STEPS.map((s, i) => (
        <li key={s} className={!demo && i <= step ? 'is-done' : ''} aria-current={!demo && i === step ? 'step' : undefined}>{STATUS_LABELS[s]}</li>
      ))}
    </ol>
  );
}

function OrderCard({ order, onCancel, onReorder }) {
  return (
    <article className="slip">
      <div className="slip__head">
        <h3 className="slip__title">سفارش #{formatNumber(order.id)}</h3>
        {order.status === 'completed' && <span className="stamp stamp--big">تحویل شد</span>}
        {order.status === 'cancelled' && <span className="stamp stamp--big stamp--void">لغو شد</span>}
        <span className="slip__meta">{formatDate(order.created_at)}</span>
      </div>
      {order.status === 'cancelled' ? <p className="muted small">این سفارش لغو شد.</p> : <Lamps status={order.status} paper />}
      <ul className="order__lines" style={{ marginTop: '0.8rem' }}>
        {order.items.map((it) => (
          <li key={it.id}>
            <span>
              {formatNumber(it.quantity)} × {it.name}
              {it.discount_percent > 0 && <> <DiscountBadge percent={it.discount_percent} /></>}
            </span>
            <span className="num">{formatMoney(it.final_price * it.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="slip__foot">
        <dl className="totals">
          {order.discount_total > 0 && <div className="is-save"><dt>صرفه‌جویی</dt><dd>{formatMoney(order.discount_total)}</dd></div>}
          <div className="is-total"><dt>پرداخت</dt><dd>{formatMoney(order.total)}</dd></div>
        </dl>
        <p className="muted small" style={{ margin: 0 }}>{PAYMENT_LABELS[order.payment_method]} · {order.address}</p>
        <div className="order__actions">
          {order.status === 'pending' && <button className="btn btn--danger btn--sm" onClick={() => onCancel(order)}>لغو سفارش</button>}
          <button className="btn btn--ink btn--sm" onClick={() => onReorder(order)}>سفارش دوباره</button>
        </div>
      </div>
    </article>
  );
}

function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '', currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const d = await api('/auth/me', { method: 'PUT', body: form });
      setUser(d.user);
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
      setMsg('ذخیره شد');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="paper form" onSubmit={save}>
      <h2>حساب کاربری</h2>
      <label>نام<input required value={form.name} onChange={set('name')} /></label>
      <label>نام کاربری<input dir="ltr" value={user.username} disabled /></label>
      <label>شمارهٔ موبایل<input dir="ltr" value={form.phone} onChange={set('phone')} inputMode="tel" /></label>
      <label>نشانی پیش‌فرض<textarea rows={3} value={form.address} onChange={set('address')} /></label>
      <details>
        <summary>تغییر رمز عبور</summary>
        <label>رمز عبور فعلی<PasswordInput value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" /></label>
        <label>رمز عبور جدید<PasswordInput minLength={6} value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" /></label>
      </details>
      {error && <p className="error" role="alert">{error}</p>}
      {msg && <p className="ok" role="status">{msg}</p>}
      <button className="btn btn--red">ذخیره</button>
    </form>
  );
}

export default function Account() {
  const { user, logout } = useAuth();
  const { add } = useCart();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const placed = params.get('placed');
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const active = orders?.find((o) => ['pending', 'confirmed', 'preparing', 'delivering'].includes(o.status));

  const load = () => api('/orders/mine').then(setOrders).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    const t = setInterval(load, 20000); // keep order status fresh
    return () => clearInterval(t);
  }, []);

  const cancel = async (order) => {
    if (!confirm(`سفارش #${formatNumber(order.id)} لغو شود؟`)) return;
    try {
      await api(`/orders/${order.id}/cancel`, { method: 'POST' });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const reorder = async (order) => {
    const products = await api('/products');
    let added = 0;
    for (const it of order.items) {
      const p = products.find((x) => x.id === it.product_id);
      if (p) {
        add(p, it.quantity);
        added++;
      }
    }
    if (!added) return alert('این اقلام دیگر در منو نیستند.');
    nav('/cart');
  };

  return (
    <section className="page container">
      <div className="section__head">
        <h1 className="page__title" style={{ margin: 0 }}>سلام، {user.name.split(' ')[0]}</h1>
        <button className="btn btn--line" style={{ color: 'var(--paper)' }} onClick={() => { logout(); nav('/'); }}>خروج</button>
      </div>
      {placed && (
        <div className="notice" role="status">
          <CheckIcon width={22} height={22} />
          <span>سفارش #{formatNumber(placed)} ثبت شد. به‌زودی تأییدش می‌کنیم؛ وضعیتش را همین‌جا دنبال کنید.</span>
        </div>
      )}
      <div className="account-layout">
        <div>
          {active && (
            <section className="callnum" aria-label="سفارش فعال">
              <div className="callnum__num">
                <small>شمارهٔ شما</small>
                <span className="led">{formatNumber(active.id)}</span>
              </div>
              <Lamps status={active.status} />
            </section>
          )}
          <h2 className="section__title" style={{ color: 'var(--paper)', fontSize: 'var(--fs-heading)', marginBottom: '1rem' }}>سفارش‌های من</h2>
          {error && <p className="empty">{error}</p>}
          {!orders && !error && <p className="page-loading">در حال بارگذاری…</p>}
          {orders && orders.length === 0 && <p className="empty">هنوز سفارشی ثبت نکرده‌اید.</p>}
          <div className="orders">{orders?.map((o) => <OrderCard key={o.id} order={o} onCancel={cancel} onReorder={reorder} />)}</div>
        </div>
        <Profile />
      </div>
    </section>
  );
}
