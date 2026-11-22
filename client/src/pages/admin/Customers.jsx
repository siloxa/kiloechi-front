import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { formatDate, formatMoney, formatNumber } from '../../lib/format.js';

export default function Customers() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/users').then(setUsers).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="admin__head"><h1>مشتریان</h1></div>
      {error && <p className="error">{error}</p>}
      {!users && !error && <p className="muted">در حال بارگذاری…</p>}
      {users && (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>نام</th><th>نام کاربری</th><th>موبایل</th><th>نقش</th><th>سفارش‌ها</th><th>مجموع خرید</th><th>تاریخ عضویت</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td dir="ltr" className="ltr-cell">{u.username}</td>
                  <td dir="ltr" className="ltr-cell">{u.phone || <span className="muted">—</span>}</td>
                  <td>{u.role === 'admin' ? <span className="dtag is-live">مدیر</span> : 'مشتری'}</td>
                  <td>{formatNumber(u.order_count)}</td>
                  <td>{formatMoney(u.spent)}</td>
                  <td className="muted small">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
