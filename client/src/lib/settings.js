import { useEffect, useState } from 'react';
import { api } from './api.js';

let cache = null;
let pending = null;
const listeners = new Set();

function load() {
  pending ||= api('/settings')
    .then((s) => {
      cache = s;
      listeners.forEach((fn) => fn(s));
      return s;
    })
    .catch(() => {
      pending = null;
      return null;
    });
  return pending;
}

/** Restaurant details (address, phone, socials, card). Empty strings mean "not provided yet": hide them. */
export function useSettings() {
  const [s, setS] = useState(cache);
  useEffect(() => {
    listeners.add(setS);
    if (!cache) load();
    return () => listeners.delete(setS);
  }, []);
  return s;
}

/** Call after the admin saves, so every open component updates. */
export function setSettingsCache(s) {
  cache = s;
  listeners.forEach((fn) => fn(s));
}
