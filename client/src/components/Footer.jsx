import { useSettings } from '../lib/settings.js';
import Logo from './Logo.jsx';
import { ClockIcon, InstagramIcon, PhoneIcon, PinIcon, TelegramIcon } from './Icons.jsx';

// Only shows details the owner has entered in Admin → Settings; nothing here is invented.
export default function Footer() {
  const s = useSettings() || {};
  return (
    <footer className="footer" id="contact">
      <div className="container footer__inner">
        <Logo />
        {(s.address || s.phone || s.hours) && (
          <ul className="footer__info">
            {s.address && <li><PinIcon width={22} height={22} /><span>{s.address}</span></li>}
            {s.phone && <li><PhoneIcon width={20} height={20} /><a href={`tel:${s.phone}`} dir="ltr">{s.phone}</a></li>}
            {s.hours && <li><ClockIcon width={20} height={20} /><span>{s.hours}</span></li>}
          </ul>
        )}
        {(s.instagram || s.telegram) && (
          <div className="footer__social" aria-label="شبکه‌های اجتماعی">
            {s.instagram && <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer" aria-label="اینستاگرام"><InstagramIcon /></a>}
            {s.telegram && <a href={`https://t.me/${s.telegram}`} target="_blank" rel="noreferrer" aria-label="تلگرام"><TelegramIcon /></a>}
          </div>
        )}
        <p className="footer__copy">© {new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} Kiloechi · سفارش آنلاین مرغ سوخاری</p>
      </div>
    </footer>
  );
}
