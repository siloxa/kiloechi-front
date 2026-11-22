import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatMoney, latinDigits } from '../../lib/format.js';

const EMPTY = {
  name: '',
  description: '',
  price: '',
  image: '',
  category_id: '',
  discount_percent: 0,
  discount_start: '',
  discount_end: '',
  is_active: true,
  is_featured: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/categories').then(setCategories).catch(() => {});
    if (!isNew)
      api(`/admin/products/${id}`)
        .then((p) =>
          setForm({
            ...EMPTY,
            ...p,
            category_id: p.category_id ?? '',
            discount_start: p.discount_start || '',
            discount_end: p.discount_end || '',
          }),
        )
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setNum = (k) => (e) => setForm((f) => ({ ...f, [k]: latinDigits(e.target.value).replace(/[^\d]/g, '') }));

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { url } = await api('/admin/upload', { method: 'POST', form: fd });
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = { ...form, price: Number(form.price), discount_percent: Number(form.discount_percent) || 0 };
      if (isNew) await api('/admin/products', { method: 'POST', body });
      else await api(`/admin/products/${id}`, { method: 'PUT', body });
      nav('/admin/products');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (loading) return <p className="muted">در حال بارگذاری…</p>;

  const price = Number(form.price) || 0;
  const pct = Number(form.discount_percent) || 0;
  const final = Math.round((price * (100 - pct)) / 100);

  return (
    <>
      <div className="admin__head">
        <h1>{isNew ? 'افزودن محصول' : `ویرایش: ${form.name}`}</h1>
        <Link to="/admin/products" className="btn btn--ghost">بازگشت</Link>
      </div>

      <form className="pform" onSubmit={save}>
        <div className="card form">
          <h2>مشخصات</h2>
          <label>نام<input required value={form.name} onChange={set('name')} /></label>
          <label>توضیحات<textarea rows={3} value={form.description} onChange={set('description')} /></label>
          <div className="row2">
            <label>قیمت (تومان)<input required inputMode="numeric" dir="ltr" value={form.price} onChange={setNum('price')} /></label>
            <label>
              دسته‌بندی
              <select value={form.category_id} onChange={set('category_id')}>
                <option value="">— بدون دسته —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <label className="check"><input type="checkbox" checked={!!form.is_active} onChange={set('is_active')} /> نمایش در سایت</label>
          <label className="check"><input type="checkbox" checked={!!form.is_featured} onChange={set('is_featured')} /> نمایش در نوار منوی صفحهٔ اول</label>
        </div>

        <div className="card form">
          <h2>عکس</h2>
          <div className="imgpick">
            {form.image ? <img src={form.image} alt="" /> : <div className="imgpick__ph">بدون عکس</div>}
            <div>
              <label className="btn btn--yellow filebtn">
                {uploading ? 'در حال بارگذاری…' : 'بارگذاری عکس'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={upload} className="sr-only" />
              </label>
              <label>یا نشانی اینترنتی عکس<input dir="ltr" value={form.image} onChange={set('image')} placeholder="https://…" /></label>
            </div>
          </div>
        </div>

        <div className="card form">
          <h2>تخفیف</h2>
          <div className="row2">
            <label>درصد تخفیف<input inputMode="numeric" dir="ltr" value={form.discount_percent} onChange={setNum('discount_percent')} /></label>
            <div className="preview-price">
              <span className="muted small">مبلغی که مشتری می‌پردازد</span>
              <span>
                {pct > 0 && <s className="muted">{formatMoney(price)}</s>} <strong>{formatMoney(final)}</strong>
              </span>
            </div>
          </div>
          <div className="row2">
            <label>شروع (اختیاری)<input type="date" value={form.discount_start} onChange={set('discount_start')} disabled={!pct} /></label>
            <label>پایان (اختیاری)<input type="date" value={form.discount_end} onChange={set('discount_end')} disabled={!pct} /></label>
          </div>
          <p className="muted small">بدون تاریخ، تخفیف تا وقتی خودتان حذفش کنید فعال می‌ماند. برای خاموش کردن، درصد را ۰ کنید.</p>
        </div>

        <div className="pform__actions">
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn btn--red btn--lg" disabled={busy || uploading}>{busy ? 'در حال ذخیره…' : isNew ? 'ساخت محصول' : 'ذخیرهٔ تغییرات'}</button>
        </div>
      </form>
    </>
  );
}
