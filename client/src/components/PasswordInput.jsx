import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons.jsx';

/** Password field with a show/hide toggle. Paste and password managers keep working. */
export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <span className="pwfield">
      <input {...props} type={show ? 'text' : 'password'} dir="ltr" />
      <button
        type="button"
        className="pwfield__toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
        aria-pressed={show}
      >
        {show ? <EyeOffIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
      </button>
    </span>
  );
}
