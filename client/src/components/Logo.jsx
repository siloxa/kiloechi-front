import { Link } from 'react-router-dom';

// Placeholder lockup until the restaurant's real logo arrives: put the file in client/public/logo.svg
// and replace the two spans with <img src="/logo.svg" alt="Kiloechi" height="42" />.
export default function Logo({ to = '/', label = 'Kiloechi، صفحهٔ اصلی' }) {
  return (
    <Link to={to} className="logo" aria-label={label}>
      <span className="logo__mark" aria-hidden>K</span>
      <span className="logo__word">Kiloechi</span>
    </Link>
  );
}
