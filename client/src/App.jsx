import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import YourSlip from './components/YourSlip.jsx';
import { AuthProvider, RequireAuth } from './lib/auth.jsx';
import { useCart } from './lib/cart.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import { Login, Register } from './pages/AuthPages.jsx';
import Account from './pages/account/Account.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Products from './pages/admin/Products.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import Orders from './pages/admin/Orders.jsx';
import Categories from './pages/admin/Categories.jsx';
import Customers from './pages/admin/Customers.jsx';
import Settings from './pages/admin/Settings.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminAccount from './pages/admin/AdminAccount.jsx';

/** Scroll to top on page change, or to the #anchor when there is one. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function SiteLayout() {
  const { flash } = useCart();
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <YourSlip />
      {/* Screen readers hear each add; sighted users see it print onto "your slip". */}
      <div className="sr-only" role="status" aria-live="polite">{flash}</div>
    </>
  );
}

function NotFound() {
  return (
    <section className="container page center">
      <h1 className="page__title">این صفحه پیدا نشد</h1>
      <a className="btn btn--ink btn--lg" href="/menu">رفتن به منو</a>
    </section>
  );
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Admin panel: a separate app with its own session (AuthProvider scope="admin") and its own login page. */}
        <Route path="admin" element={<AuthProvider scope="admin"><Outlet /></AuthProvider>}>
          <Route path="login" element={<AdminLogin />} />
          <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<Categories />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="account" element={<AdminAccount />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
