// The customer site and the admin panel keep separate sessions in separate storage keys,
// so signing in or out of one never affects the other.
const KEYS = { customer: 'kiloechi_token', admin: 'kiloechi_admin_token' };

function makeStore(key) {
  return {
    get() {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(t) {
      try {
        localStorage.setItem(key, t);
      } catch {}
    },
    clear() {
      try {
        localStorage.removeItem(key);
      } catch {}
    },
  };
}

export const tokenStores = { customer: makeStore(KEYS.customer), admin: makeStore(KEYS.admin) };

/** Admin API paths use the admin session; everything else uses the customer session. */
const scopeFor = (path) => (path === '/admin' || path.startsWith('/admin/') ? 'admin' : 'customer');

/** Small fetch wrapper: JSON in/out, bearer token, readable errors. Pass `form` for multipart uploads. */
export async function api(path, { method = 'GET', body, form, scope, noRedirect = false } = {}) {
  const headers = {};
  const token = tokenStores[scope || scopeFor(path)].get();

  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const s = scope || scopeFor(path);
  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  if (res.status === 204) return null;
  // Expired or revoked session: drop it and go to that panel's own login page.
  if (res.status === 401 && token && !noRedirect && !/\/login$/.test(path)) {
    tokenStores[s].clear();
    const login = s === 'admin' ? '/admin/login' : '/login';
    if (!location.pathname.startsWith(login)) {
      location.assign(`${login}?next=${encodeURIComponent(location.pathname + location.search)}`);
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `خطا در ارتباط با سرور (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
