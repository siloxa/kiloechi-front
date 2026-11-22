import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function Categories() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const load = () => api('/categories').then(setList).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/admin/categories', { method: 'POST', body: { name } });
      setName('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (c) => {
    if (!confirm(`دسته‌بندی «${c.name}» حذف شود؟ محصولاتش باقی می‌مانند، بدون دسته.`)) return;
    await api(`/admin/categories/${c.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <div className="admin__head"><h1>دسته‌بندی‌ها</h1></div>
      <form className="card row" onSubmit={add}>
        <input className="search" required placeholder="نام دسته‌بندی جدید" aria-label="نام دسته‌بندی جدید" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn--red">افزودن</button>
        {error && <span className="error" role="alert">{error}</span>}
      </form>
      <ul className="card catlist">
        {list.map((c) => (
          <li key={c.id}>
            <span>{c.name}</span>
            <button className="btn btn--sm btn--danger" onClick={() => del(c)}>حذف</button>
          </li>
        ))}
        {list.length === 0 && <li className="muted">هنوز دسته‌بندی‌ای ندارید.</li>}
      </ul>
    </>
  );
}
