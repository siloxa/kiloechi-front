import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import PasswordInput from '../../components/PasswordInput.jsx';

/** Admin panel sign-in. Separate from the customer login: no sign-up, admin accounts only. */
export default function AdminLogin() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const target = next && next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={target} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
      nav(target, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="adminlogin">
      <div className="adminlogin__card">
        <header className="adminlogin__head">
          <span className="logo__mark" aria-hidden>K</span>
          <div>
            <span className="logo__word">Kiloechi</span>
            <h1>ورود به پنل مدیریت</h1>
          </div>
        </header>
        <div className="slip__printer" aria-hidden />
        <div className="slip">
        <form className="form" onSubmit={submit}>
          <label>
            نام کاربری مدیر
            <input dir="ltr" required value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} />
          </label>
          <label>
            رمز عبور
            <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn btn--ink btn--block btn--lg" disabled={busy}>{busy ? 'در حال ورود…' : 'ورود'}</button>
        </form>
        <p className="adminlogin__foot muted small">
          مشتری هستید؟ <Link to="/login">ورود مشتریان</Link> · <Link to="/">بازگشت به سایت</Link>
        </p>
        </div>
      </div>
    </main>
  );
}
