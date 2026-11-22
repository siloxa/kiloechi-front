// Prices are stored as whole Toman. Numbers and dates are shown with Persian digits;
// dates use the Solar Hijri calendar (fa-IR default).
const num = new Intl.NumberFormat('fa-IR');
export const formatNumber = (n) => num.format(Number(n) || 0);
export const formatMoney = (n) => `${num.format(Number(n) || 0)} تومان`;

const toDate = (s) => new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
export const formatDate = (s) => (s ? toDate(s).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }) : '');
/** For 'YYYY-MM-DD' values (discount dates). */
export const formatDay = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('fa-IR', { dateStyle: 'medium' }) : '');

export const STATUS_LABELS = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شد',
  preparing: 'در حال آماده‌سازی',
  delivering: 'در راه',
  completed: 'تحویل شد',
  cancelled: 'لغو شد',
};
export const STATUSES = Object.keys(STATUS_LABELS);

export const PAYMENT_LABELS = {
  cod: 'پرداخت هنگام تحویل (نقد یا کارت‌خوان)',
  transfer: 'کارت به کارت پس از تأیید سفارش',
};

/** Persian/Arabic digits → ASCII, for number inputs typed on a Persian keyboard. */
export const latinDigits = (s) =>
  String(s ?? '')
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
