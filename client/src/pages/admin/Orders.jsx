import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { PAYMENT_LABELS, STATUSES, STATUS_LABELS, formatDate, formatMoney, formatNumber } from '../../lib/format.js';
import { StatusBadge } from '../account/Account.jsx';

// The rail: open orders move one stage at a time with a single button.
const RAIL = ['pending', 'confirmed', 'preparing', 'delivering'];
const NEXT = {
  pending: { to: 'confirmed', label: 'تأیید سفارش' },
  confirmed: { to: 'preparing', label: 'شروع آماده‌سازی' },
  preparing: { to: 'delivering', label: 'ارسال شد' },
  delivering: { to: 'completed', label: 'تحویل شد' },
};

function Ticket({ order, onMove, busy }) {
  const next = NEXT[order.status];
  return (
    <article className="slip ticket" aria-label={`سفارش ${formatNumber(order.id)}`}>
      <div className="slip__head">
        <h3 className="slip__title">#{formatNumber(order.id)}</h3>
        <span className="slip__meta">{formatDate(order.created_at)}</span>
      </div>
      <ul className="ticket__lines">
        {order.items.map((it) => (
          <li key={it.id}><span>{formatNumber(it.quantity)} × {it.name}</span></li>
        ))}
      </ul>
      {order.note && <p className="ticket__note">{order.note}</p>}
      <p className="ticket__meta">
        <strong>{order.customer_name}</strong> · <a href={`tel:${order.phone}`} dir="ltr">{order.phone}</a>
        <br />
        {order.address}
        <br />
        {PAYMENT_LABELS[order.payment_method]} · <strong className="num">{formatMoney(order.total)}</strong>
      </p>
      <div className="ticket__actions">
        {next && (
          <button className="btn btn--ink btn--sm" disabled={busy} onClick={() => onMove(order, next.to)}>{next.label}</button>
        )}
        {['pending', 'confirmed'].includes(order.status) && (
          <button
            className="btn btn--danger btn--sm"
            disabled={busy}
            onClick={() => confirm(`سفارش #${formatNumber(order.id)} لغو شود؟`) && onMove(order, 'cancelled')}
          >
            لغو
          </button>
        )}
      </div>
    </article>
  );
}

export default function Orders() {
  const [view, setView] = useState('rail');
  const [orders, setOrders] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = () => api('/admin/orders').then(setOrders).catch((e) => setError(e.message));
    load();
    const t = setInterval(load, 15000); // new orders arrive on the rail without refreshing
    return () => clearInterval(t);
  }, []);

  const move = async (order, status) => {
    setBusyId(order.id);
    try {
      const updated = await api(`/admin/orders/${order.id}`, { method: 'PATCH', body: { status } });
      setOrders((list) => list.map((o) => (o.id === order.id ? updated : o)));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const history = (orders || []).filter((o) => !RAIL.includes(o.status));

  return (
    <>
      <div className="admin__head">
        <h1>سفارش‌ها</h1>
        <div className="chips" role="group" aria-label="نما" style={{ margin: 0 }}>
          <button className={`chip ${view === 'rail' ? 'is-on' : ''}`} aria-pressed={view === 'rail'} onClick={() => setView('rail')}>ریل سفارش‌های باز</button>
          <button className={`chip ${view === 'history' ? 'is-on' : ''}`} aria-pressed={view === 'history'} onClick={() => setView('history')}>
            تاریخچه ({formatNumber(history.length)})
          </button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {!orders && !error && <p className="muted">در حال بارگذاری…</p>}

      {orders && view === 'rail' && (
        <div className="rail">
          {RAIL.map((stage) => {
            const list = orders.filter((o) => o.status === stage).sort((a, b) => a.id - b.id);
            return (
              <section key={stage} className="rail__col" aria-label={STATUS_LABELS[stage]}>
                <div className="rail__head"><span>{STATUS_LABELS[stage]}</span><span className="led">{formatNumber(list.length)}</span></div>
                {list.length === 0 && <p className="rail__empty">خالی</p>}
                {list.map((o) => <Ticket key={o.id} order={o} onMove={move} busy={busyId === o.id} />)}
              </section>
            );
          })}
        </div>
      )}

      {orders && view === 'history' && (
        <div className="card table-wrap">
          {history.length === 0 ? (
            <p className="empty">هنوز سفارش تمام‌شده‌ای نیست.</p>
          ) : (
            <table className="table">
              <thead><tr><th>#</th><th>مشتری</th><th>زمان</th><th>اقلام</th><th>مبلغ</th><th>وضعیت</th></tr></thead>
              <tbody>
                {history.map((o) => (
                  <tr key={o.id}>
                    <td>{formatNumber(o.id)}</td>
                    <td>{o.customer_name}<br /><span className="muted" dir="ltr">{o.phone}</span></td>
                    <td className="muted">{formatDate(o.created_at)}</td>
                    <td>{o.items.map((it) => `${formatNumber(it.quantity)}× ${it.name}`).join('، ')}</td>
                    <td>{formatMoney(o.total)}</td>
                    <td>
                      {o.status === 'completed' && <span className="stamp">تحویل شد</span>}
                      {o.status === 'cancelled' && <span className="stamp stamp--void">لغو شد</span>}
                      <label className="statuspick">
                        <span className="sr-only">وضعیت سفارش {formatNumber(o.id)}</span>
                        <select value={o.status} onChange={(e) => move(o, e.target.value)} disabled={busyId === o.id}>
                          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
