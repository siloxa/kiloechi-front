import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { setSettingsCache } from '../../lib/settings.js';

const FIELDS = [
  { key: 'address', label: 'نشانی رستوران', area: true },
  { key: 'phone', label: 'تلفن تماس', ltr: true },
  { key: 'hours', label: 'ساعات کاری', placeholder: 'مثلاً هر روز ۱۲ تا ۲۳' },
  { key: 'instagram', label: 'آیدی اینستاگرام', ltr: true, placeholder: 'kiloechi' },
  { key: 'telegram', label: 'آیدی تلگرام', ltr: true },
  { key: 'card_number', label: 'شماره کارت برای کارت به کارت', ltr: true, hint: 'اگر خالی باشد، گزینهٔ کارت به کارت به مشتری نشان داده نمی‌شود.' },
  { key: 'card_holder', label: 'نام صاحب کارت' },
];

export default function Settings() {
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/settings').then(setForm).catch((e) => setError(e.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const s = await api('/admin/settings', { method: 'PUT', body: form });
      setForm(s);
      setSettingsCache(s);
      setMsg('ذخیره شد');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!form) return error ? <p className="error">{error}</p> : <p className="muted">در حال بارگذاری…</p>;

  return (
    <>
      <div className="admin__head"><h1>اطلاعات رستوران</h1></div>
      <form className="card form settings-form" onSubmit={save}>
        <p className="muted small">این اطلاعات در پایین سایت و صفحهٔ پرداخت نمایش داده می‌شود. هر فیلد خالی، در سایت نمایش داده نمی‌شود.</p>
        {FIELDS.map((f) => (
          <label key={f.key}>
            {f.label}
            {f.area ? (
              <textarea rows={2} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            ) : (
              <input
                dir={f.ltr ? 'ltr' : undefined}
                value={form[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                aria-describedby={f.hint ? `${f.key}-hint` : undefined}
              />
            )}
            {f.hint && <span id={`${f.key}-hint`} className="hint">{f.hint}</span>}
          </label>
        ))}
        {error && <p className="error" role="alert">{error}</p>}
        {msg && <p className="ok" role="status">{msg}</p>}
        <button className="btn btn--red" disabled={busy}>{busy ? 'در حال ذخیره…' : 'ذخیره'}</button>
      </form>
    </>
  );
}
