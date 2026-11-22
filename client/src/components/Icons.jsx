const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const CartIcon = (p) => (
  <svg {...base} {...p}><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></svg>
);
export const PinIcon = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" /></svg>
);
export const InstagramIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
);
export const FacebookIcon = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4.5v-6.5h2.3l.4-2.8h-2.7V9.9c0-.8.3-1.4 1.4-1.4h1.4V6a18 18 0 0 0-2.1-.1c-2.1 0-3.5 1.3-3.5 3.6v2.2H9.4v2.8h2.3V21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /></svg>
);
export const ChevronLeft = (p) => <svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>;
export const ChevronRight = (p) => <svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>;
export const MenuIcon = (p) => <svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
export const CloseIcon = (p) => <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>;
export const PlusIcon = (p) => <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>;
export const MinusIcon = (p) => <svg {...base} {...p}><path d="M5 12h14" /></svg>;
export const DashboardIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
);
export const ReceiptIcon = (p) => (
  <svg {...base} {...p}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>
);
export const DrumstickIcon = (p) => (
  <svg {...base} {...p}><path d="M15.5 3.5a5 5 0 0 1 2 8.3c-1.7 1.7-4.6 1.9-6.3 1.5l-3 3a2 2 0 1 1-2.8 1.6 2 2 0 1 1 1.6-2.8l3-3c-.4-1.7-.2-4.6 1.5-6.3a5 5 0 0 1 4-2.3Z" /></svg>
);
export const TagIcon = (p) => (
  <svg {...base} {...p}><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" /><circle cx="7.5" cy="7.5" r="1.4" /></svg>
);
export const UsersIcon = (p) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14a6 6 0 0 1 3 6" /></svg>
);
export const SettingsIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>
);
export const FlameIcon = (p) => (
  <svg {...base} {...p}><path d="M12 22c4 0 7-2.7 7-6.6 0-3.6-2.6-5.6-3.7-8.9-.4 1.9-1.4 3.1-2.6 3.7.3-3.4-1.2-6.4-4-8.2.3 3.4-1.5 5.3-3 7.2A7.7 7.7 0 0 0 5 15.4C5 19.3 8 22 12 22Z" /></svg>
);
export const CheckIcon = (p) => <svg {...base} {...p}><path d="m5 12 4.5 4.5L19 7" /></svg>;
export const PhoneIcon = (p) => (
  <svg {...base} {...p}><path d="M5 3h3.5l2 5-2.5 1.5a11 11 0 0 0 6.5 6.5L16 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" /></svg>
);
export const ClockIcon = (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
export const TelegramIcon = (p) => (
  <svg {...base} {...p}><path d="m21 4-18 7.3 6 2.2 2.2 6.5 3.3-4.3 4.7 3.6L21 4Z" /><path d="m9 13.5 7.5-5.5" /></svg>
);
export const EyeIcon = (p) => (
  <svg {...base} {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const EyeOffIcon = (p) => (
  <svg {...base} {...p}><path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
);
export const TrashIcon = (p) => (
  <svg {...base} {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);
