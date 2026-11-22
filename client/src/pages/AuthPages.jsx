import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

function useAfterLogin() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const next = params.get('next');
  // Only allow in-app paths as redirect targets.
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
  const target = () => (safeNext && !safeNext.startsWith('/admin') ? safeNext : '/account');
  const go = (user) => nav(target(user), { replace: true });
  return { go, target };
}

function AuthShell({ title, children, footer }) {
  return (
    <section className="authpage">
      <div className="authcard">
        <div className="slip__printer" aria-hidden />
        <div className="slip">
          <div className="slip__head"><h1 className="slip__title">{title}</h1></div>
          {children}
          <p className="muted center small" style={{ marginBottom: 0 }}>{footer}</p>
        </div>
      </div>
    </section>
  );
}

export function Login() {
  const { user, login } = useAuth();
  const { go, target } = useAfterLogin();
  const [params] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={target(user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      go(await login(username, password));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const qs = params.toString();
  return (
    <AuthShell title="ورود" footer={<>حساب ندارید؟ <Link to={`/register${qs ? `?${qs}` : ''}`}>ثبت‌نام کنید</Link></>}>
      <form className="form" onSubmit={submit}>
        <label>نام کاربری<input dir="ltr" required value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} /></label>
        <label>رمز عبور<PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn--ink btn--block btn--lg" disabled={busy}>{busy ? 'در حال ورود…' : 'ورود'}</button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const { go, target } = useAfterLogin();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', username: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={target(user)} replace />;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      go(await register(form));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const qs = params.toString();
  return (
    <AuthShell title="ثبت‌نام" footer={<>قبلاً ثبت‌نام کرده‌اید؟ <Link to={`/login${qs ? `?${qs}` : ''}`}>وارد شوید</Link></>}>
      <form className="form" onSubmit={submit}>
        <label>نام و نام خانوادگی<input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
        <label>
          نام کاربری
          <input dir="ltr" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_.۰-۹]{3,30}" value={form.username} onChange={set('username')} autoComplete="username" autoCapitalize="none" spellCheck={false} aria-describedby="user-hint" />
          <span id="user-hint" className="hint">۳ تا ۳۰ حرف انگلیسی، عدد، نقطه یا زیرخط؛ برای ورود از آن استفاده می‌کنید.</span>
        </label>
        <label>شمارهٔ موبایل<input dir="ltr" value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" placeholder="09xxxxxxxxx" /></label>
        <label>
          رمز عبور
          <PasswordInput required minLength={6} value={form.password} onChange={set('password')} autoComplete="new-password" aria-describedby="pw-hint" />
          <span id="pw-hint" className="hint">حداقل ۶ کاراکتر</span>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn--ink btn--block btn--lg" disabled={busy}>{busy ? 'در حال ساخت حساب…' : 'ساخت حساب'}</button>
      </form>
    </AuthShell>
  );
}
