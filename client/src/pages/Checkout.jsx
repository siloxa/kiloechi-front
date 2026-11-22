import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useCart } from '../lib/cart.jsx';
import { PAYMENT_LABELS, formatMoney, formatNumber } from '../lib/format.js';
import { useSettings } from '../lib/settings.js';
import { Totals } from './Cart.jsx';

export default function Checkout() {
  const { user, setUser } = useAuth();
  const cart = useCart();
  const settings = useSettings() || {};
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    note: '',
    payment_method: 'cod',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const placed = useRef(false);

  if (!cart.items.length && !placed.current) return <Navigate to="/cart" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // Card-to-card only makes sense once the restaurant has entered its card number.
  const methods = settings.card_number ? ['cod', 'transfer'] : ['cod'];

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const order = await api('/orders', {
        method: 'POST',
        body: { ...form, items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })) },
      });
      placed.current = true; // stops the empty-cart redirect from firing once we clear
      cart.clear();
      nav(`/account?placed=${order.id}`);
      setUser({ ...user, phone: form.phone, address: form.address });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <section className="page container">
      <h1 className="page__title">ثبت سفارش</h1>
      <form className="cart-layout" onSubmit={submit}>
        <div className="paper form">
          <h2>تحویل به</h2>
          <label>نام و نام خانوادگی<input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
          <label>
            شمارهٔ موبایل
            <input required dir="ltr" value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" placeholder="09xxxxxxxxx" />
          </label>
          <label>نشانی کامل<textarea required rows={3} value={form.address} onChange={set('address')} autoComplete="street-address" /></label>
          <label>توضیح برای آشپزخانه (اختیاری)<input value={form.note} onChange={set('note')} placeholder="مثلاً تندتر، بدون پیاز" /></label>

          <fieldset className="radios">
            <legend>روش پرداخت</legend>
            {methods.map((m) => (
              <label key={m} className={form.payment_method === m ? 'is-on' : ''}>
                <input type="radio" name="pay" value={m} checked={form.payment_method === m} onChange={set('payment_method')} />
                {PAYMENT_LABELS[m]}
              </label>
            ))}
          </fieldset>
          {form.payment_method === 'transfer' && (
            <p className="notice small">
              پس از تأیید سفارش، مبلغ را به کارت <strong dir="ltr">{settings.card_number}</strong>
              {settings.card_holder && <> به نام {settings.card_holder}</>} واریز کنید.
            </p>
          )}
          {error && <p className="error" role="alert">{error}</p>}
        </div>

        <aside>
          <div className="slip__printer" aria-hidden />
          <div className="slip">
            <div className="slip__head">
              <h2 className="slip__title">فیش شما</h2>
              <span className="slip__meta">{formatNumber(cart.count)} قلم</span>
            </div>
            <ul className="order__lines small">
              {cart.items.map((i) => (
                <li key={i.id}><span>{formatNumber(i.quantity)} × {i.name}</span><span className="num">{formatMoney(i.final_price * i.quantity)}</span></li>
              ))}
            </ul>
            <div className="slip__foot">
              <Totals subtotal={cart.subtotal} savings={cart.savings} total={cart.total} />
              <button className="btn btn--red btn--block btn--lg" disabled={busy}>{busy ? 'در حال ثبت…' : 'ثبت سفارش'}</button>
              <Link to="/cart" className="btn btn--line btn--block">بازگشت به فیش</Link>
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}
