import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, tokenStores } from './api.js';

const AuthContext = createContext(null);

// One provider per panel. The customer site uses scope "customer" (/api/auth/*);
// the admin panel nests its own provider with scope "admin" (/api/admin/login, /api/admin/me).
const ENDPOINTS = {
  customer: { login: '/auth/login', me: '/auth/me', loginPage: '/login' },
  admin: { login: '/admin/login', me: '/admin/me', loginPage: '/admin/login' },
};

export function AuthProvider({ scope = 'customer', children }) {
  const store = tokenStores[scope];
  const ep = ENDPOINTS[scope];
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!store.get()) return setReady(true);
    api(ep.me, { scope, noRedirect: true }) // a stale session on page load just means "signed out"
      .then((d) => setUser(d.user))
      .catch(() => store.clear())
      .finally(() => setReady(true));
  }, [scope]);

  const finish = (d) => {
    store.set(d.token);
    setUser(d.user);
    return d.user;
  };

  const login = useCallback(
    (username, password) => api(ep.login, { method: 'POST', body: { username, password }, scope }).then(finish),
    [scope],
  );
  const register = useCallback((data) => api('/auth/register', { method: 'POST', body: data, scope: 'customer' }).then(finish), []);
  const logout = useCallback(() => {
    store.clear();
    setUser(null);
  }, [scope]);

  return (
    <AuthContext.Provider value={{ scope, user, ready, login, register, logout, setUser, loginPage: ep.loginPage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

/** Guards a page for the current panel; sends signed-out visitors to that panel's own login page. */
export function RequireAuth({ children }) {
  const { user, ready, loginPage } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="page-loading">در حال بارگذاری…</div>;
  if (!user) return <Navigate to={`${loginPage}?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return children;
}
