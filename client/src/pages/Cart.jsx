import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useCart } from '../lib/cart.jsx';
import { formatMoney, formatNumber } from '../lib/format.js';
import { MinusIcon, PlusIcon, TrashIcon, DrumstickIcon } from '../components/Icons.jsx';
import { DiscountBadge } from '../components/ProductCard.jsx';

export function Totals({ subtotal, savings, total }) {
  return (
    <dl className="totals">
      <div><dt>جمع اقلام</dt><dd>{formatMoney(subtotal)}</dd></div>
      {savings > 0 && <div className="is-save"><dt>تخفیف</dt><dd>−{formatMoney(savings)}</dd></div>}
      <div className="is-total"><dt>قابل پرداخت</dt><dd>{formatMoney(total)}</dd></div>
    </dl>
  );
}

export default function Cart() {
  const { items, setQty, remove, subtotal, total, savings, refresh } = useCart();

  // Prices or discounts may have changed since the dish went on the slip.
  useEffect(() => {
    api('/products').then(refresh).catch(() => {});
  }, [refresh]);

  if (!items.length)
    return (
      <section className="page container center">
        <h1 className="page__title">فیش شما خالی است</h1>
        <p style={{ color: 'var(--paper)' }}>گرسنه‌اید؟ از فیش امروز یک چیز ترد انتخاب کنید.</p>
        <Link to="/menu" className="btn btn--ink btn--lg">دیدن منو</Link>
      </section>
    );

  return (
    <section className="page container">
      <h1 className="page__title">فیش شما</h1>
      <div className="cart-layout">
        <div>
          <div className="slip__printer" aria-hidden />
          <section className="slip" aria-label="اقلام فیش">
            <div className="slip__head">
              <h2 className="slip__title">اقلام</h2>
              <span className="slip__meta">{formatNumber(items.reduce((s, i) => s + i.quantity, 0))} قلم</span>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map((i) => (
                <li key={i.id} className="srow">
                  {i.image ? <img className="srow__img" src={i.image} alt="" width="76" height="76" /> : <span className="srow__img srow__img--ph"><DrumstickIcon width={30} /></span>}
                  <div className="srow__info">
                    <h3 className="srow__name">{i.name}</h3>
                    <p className="srow__desc num">
                      {formatMoney(i.final_price)} × {formatNumber(i.quantity)}
                      {i.effective_discount > 0 && <> · <DiscountBadge percent={i.effective_discount} /></>}
                    </p>
                  </div>
                  <div className="srow__end">
                    <span className="price"><span className="price__now">{formatMoney(i.final_price * i.quantity)}</span></span>
                    <span style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      <span className="stepper" role="group" aria-label={`تعداد ${i.name}`}>
                        <button onClick={() => setQty(i.id, i.quantity + 1)} aria-label="یکی بیشتر"><PlusIcon width={18} /></button>
                        <span className="led" aria-live="polite">{formatNumber(i.quantity)}</span>
                        <button onClick={() => setQty(i.id, i.quantity - 1)} aria-label="یکی کمتر"><MinusIcon width={18} /></button>
                      </span>
                      <button className="iconbtn remove" onClick={() => remove(i.id)} aria-label={`حذف ${i.name}`}><TrashIcon width={20} /></button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="slip" aria-label="جمع فیش">
          <div className="slip__head"><h2 className="slip__title">جمع</h2></div>
          <Totals subtotal={subtotal} savings={savings} total={total} />
          <p className="muted small">هزینهٔ ارسال هنگام تأیید سفارش اعلام می‌شود.</p>
          <div className="slip__foot">
            <Link to="/checkout" className="btn btn--red btn--block btn--lg">ادامه و ثبت سفارش</Link>
            <Link to="/menu" className="btn btn--line btn--block">افزودن غذای دیگر</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
