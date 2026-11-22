import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../lib/cart.jsx';
import { formatMoney, formatNumber } from '../lib/format.js';

/**
 * "Your slip". On desktop it prints down out of the call board after each add (as a slip feeds out of the
 * counter printer), stays while hovered or focused, then retracts, so it never hides the page behind it.
 * The board's cart count stays as the permanent summary. On phones it is a bar along the bottom.
 */
export default function YourSlip() {
  const { items, count, total, lastAdded } = useCart();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const timer = useRef();
  const hovering = useRef(false);

  const closeSoon = (ms) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => !hovering.current && setOpen(false), ms);
  };

  useEffect(() => {
    if (!lastAdded) return;
    setOpen(true);
    setBump(true);
    const t = setTimeout(() => setBump(false), 400);
    closeSoon(3500);
    return () => clearTimeout(t);
  }, [lastAdded]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => setOpen(false), [pathname]);

  const hiddenHere = ['/cart', '/checkout', '/login', '/register'].includes(pathname);
  useEffect(() => {
    document.body.classList.toggle('has-mobilebar', count > 0 && !hiddenHere);
    return () => document.body.classList.remove('has-mobilebar');
  }, [count, hiddenHere]);

  if (!count || hiddenHere) return null;
  const newest = items.find((i) => i.id === lastAdded?.id) || items[items.length - 1];
  return (
    <>
      <aside
        className={`yourslip ${open ? 'is-open' : ''}`}
        aria-label="فیش شما"
        aria-hidden={!open}
        onMouseEnter={() => { hovering.current = true; clearTimeout(timer.current); }}
        onMouseLeave={() => { hovering.current = false; closeSoon(1200); }}
        onFocus={() => { hovering.current = true; clearTimeout(timer.current); }}
        onBlur={() => { hovering.current = false; closeSoon(1200); }}
      >
        <div className="slip">
          <div className="slip__head">
            <h2 className="slip__title">فیش شما</h2>
            {lastAdded && <span className="stamp" key={lastAdded.nonce}>اضافه شد</span>}
            <span className="slip__meta">{formatNumber(count)} قلم</span>
          </div>
          <ul className="yourslip__lines">
            {newest && (
              <li key={`${newest.id}-${lastAdded?.nonce || 0}`} className="is-new">
                <span>{formatNumber(newest.quantity)} × {newest.name}</span>
                <span className="num">{formatMoney(newest.final_price * newest.quantity)}</span>
              </li>
            )}
          </ul>
          <div className="slip__foot">
            <div className="yourslip__total"><span>جمع</span><span className="num">{formatMoney(total)}</span></div>
            <Link to="/cart" className="btn btn--ink btn--block" tabIndex={open ? 0 : -1}>ادامه و ثبت سفارش</Link>
          </div>
        </div>
      </aside>
      <Link to="/cart" className={`mobilebar ${bump ? 'is-bump' : ''}`} aria-label={`فیش شما: ${formatNumber(count)} قلم، ${formatMoney(total)}`}>
        <span className="led" aria-hidden>{formatNumber(count)}</span>
        <span aria-hidden>
          <strong>فیش شما</strong>
          <br />
          <span className="small num">{formatMoney(total)}</span>
        </span>
        <span className="btn btn--yellow btn--sm" aria-hidden>ادامه</span>
      </Link>
    </>
  );
}
