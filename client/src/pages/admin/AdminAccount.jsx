import { useState } from 'react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import PasswordInput from '../../components/PasswordInput.jsx';

/** The admin's own name and password, inside the admin panel. */
export default function AdminAccount() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const d = await api('/admin/me', { method: 'PUT', body: form });
      setUser(d.user);
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
      setMsg(form.newPassword ? 'ذخیره شد؛ رمز عبور تغییر کرد' : 'ذخیره شد');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin__head"><h1>حساب مدیر</h1></div>
      <form className="card form settings-form" onSubmit={save}>
        <label>نام<input required value={form.name} onChange={set('name')} /></label>
        <label>نام کاربری<input dir="ltr" value={user.username} disabled /></label>
        <h2>تغییر رمز عبور</h2>
        <label>رمز عبور فعلی<PasswordInput value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" /></label>
        <label>
          رمز عبور جدید
          <PasswordInput minLength={6} value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" aria-describedby="np-hint" />
          <span id="np-hint" className="hint">برای تغییر ندادن رمز، این دو فیلد را خالی بگذارید.</span>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        {msg && <p className="ok" role="status">{msg}</p>}
        <button className="btn btn--red" disabled={busy}>{busy ? 'در حال ذخیره…' : 'ذخیره'}</button>
      </form>
    </>
  );
}
