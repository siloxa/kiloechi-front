import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useCart } from '../lib/cart.jsx';
import { STATUS_LABELS, formatNumber } from '../lib/format.js';
import Logo from './Logo.jsx';
import { CartIcon, CloseIcon, MenuIcon, SearchIcon } from './Icons.jsx';

const LINKS = [
  { to: '/', label: 'خانه', end: true },
  { to: '/menu', label: 'منو' },
  { to: '/menu?promo=1', label: 'تخفیف‌ها' },
  { to: '/#contact', label: 'تماس' },
];
const OPEN = ['pending', 'confirmed', 'preparing', 'delivering'];

/**
 * The board's LED readout only ever shows true information: the signed-in customer's own active
 * order number and status, otherwise today's real count of discounted dishes.
 */
function useReadout(user) {
  const [state, setState] = useState(null);
  const loc = useLocation();
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        if (user) {
          const orders = await api('/orders/mine');
          const active = orders.find((o) => OPEN.includes(o.status));
          if (active) return alive && setState({ kind: 'order', id: active.id, status: active.status });
        }
        const products = await api('/products');
        if (alive) setState({ kind: 'deals', count: products.filter((p) => p.discount_active).length });
      } catch {
        /* the board just stays dark */
      }
    };
    load();
    const t = user ? setInterval(load, 20000) : null;
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [user, loc.pathname]);
  return state;
}

export default function Navbar() {
  const { user } = useAuth();
  const { count } = useCart();
  const readout = useReadout(user);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname, loc.search, loc.hash]);

  const submitSearch = (e) => {
    e.preventDefault();
    setSearching(false);
    nav(`/menu?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="board">
      <div className="board__inner container">
        <Logo />

        {readout?.kind === 'order' && (
          <Link to="/account" className="board__readout" aria-label={`سفارش شمارهٔ ${formatNumber(readout.id)}: ${STATUS_LABELS[readout.status]}`}>
            <span className="led" aria-hidden>{formatNumber(readout.id)}</span>
            <span className="led-word" aria-hidden>
              {STATUS_LABELS[readout.status]}
              <small>شمارهٔ سفارش شما</small>
            </span>
          </Link>
        )}
        {readout?.kind === 'deals' && readout.count > 0 && (
          <Link to="/menu?promo=1" className="board__readout" aria-label={`${formatNumber(readout.count)} پیشنهاد تخفیف‌دار امروز`}>
            <span className="led" aria-hidden>{formatNumber(readout.count)}</span>
            <span className="led-word" aria-hidden>
              پیشنهاد امروز
              <small>تخفیف‌دار، تا تمام نشده</small>
            </span>
          </Link>
        )}

        <nav className={`board__nav ${open ? 'is-open' : ''}`} aria-label="منوی اصلی">
          {LINKS.map((l) =>
            l.to.includes('#') || l.to.includes('?') ? (
              <Link key={l.label} to={l.to}>{l.label}</Link>
            ) : (
              <NavLink key={l.label} to={l.to} end={l.end}>{l.label}</NavLink>
            ),
          )}
        </nav>

        <div className="board__actions">
          {searching ? (
            <form onSubmit={submitSearch} className="board__search" role="search">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => !q && setSearching(false)} placeholder="جستجو در منو…" aria-label="جستجو در منو" />
            </form>
          ) : (
            <button className="iconbtn" onClick={() => setSearching(true)} aria-label="جستجو"><SearchIcon /></button>
          )}
          <Link to="/cart" className="iconbtn board__cart" aria-label={`فیش شما، ${formatNumber(count)} قلم`}>
            <CartIcon />
            {count > 0 && <span className="led" aria-hidden>{formatNumber(count)}</span>}
          </Link>
          <Link to={user ? '/account' : '/login'} className="board__account">
            {user ? user.name.split(' ')[0] : 'ورود'}
          </Link>
          <button className="iconbtn board__burger" onClick={() => setOpen((o) => !o)} aria-label="باز و بسته کردن منو" aria-expanded={open}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
