import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import { api } from '../../lib/api.js';
import { formatNumber } from '../../lib/format.js';
import {
  CloseIcon, DashboardIcon, DrumstickIcon, MenuIcon, ReceiptIcon, SettingsIcon, TagIcon, UsersIcon,
} from '../../components/Icons.jsx';

const NAV = [
  { to: '/admin', label: 'داشبورد', Icon: DashboardIcon, end: true },
  { to: '/admin/orders', label: 'سفارش‌ها', Icon: ReceiptIcon },
  { to: '/admin/products', label: 'محصولات و تخفیف‌ها', Icon: DrumstickIcon },
  { to: '/admin/categories', label: 'دسته‌بندی‌ها', Icon: TagIcon },
  { to: '/admin/customers', label: 'مشتریان', Icon: UsersIcon },
  { to: '/admin/settings', label: 'اطلاعات رستوران', Icon: SettingsIcon },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  // Open orders as an LED count on the Orders link, refreshed while the panel is open.
  const [openOrders, setOpenOrders] = useState(0);
  useEffect(() => {
    const load = () => api('/admin/stats').then((s) => setOpenOrders(s.openOrders)).catch(() => {});
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`admin ${open ? 'nav-open' : ''}`}>
      <aside className="admin__side">
        <Link to="/admin" className="logo" aria-label="پنل مدیریت Kiloechi">
          <span className="logo__mark" aria-hidden>K</span>
          <span className="logo__word">Kiloechi <small>پنل مدیریت</small></span>
        </Link>
        <nav onClick={() => setOpen(false)} aria-label="منوی مدیریت">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon width={20} height={20} /> {label}
              {to === '/admin/orders' && openOrders > 0 && <span className="led" aria-label={`${formatNumber(openOrders)} سفارش باز`}>{formatNumber(openOrders)}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin__sidefoot">
          <a href="/" target="_blank" rel="noreferrer">مشاهدهٔ سایت</a>
          <Link to="/admin/account">حساب من و رمز عبور</Link>
          <button className="linkbtn" onClick={() => { logout(); nav('/admin/login'); }}>خروج</button>
        </div>
      </aside>
      <div className="admin__main">
        <header className="admin__top">
          <button className="iconbtn admin__burger" onClick={() => setOpen((o) => !o)} aria-label="باز و بسته کردن منو" aria-expanded={open}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
          <span className="muted">وارد شده با <strong>{user.name}</strong></span>
        </header>
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
