import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CART_KEY = 'kiloechi_cart';
const CartContext = createContext(null);

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const snapshot = (p) => ({
  id: p.id,
  name: p.name,
  image: p.image,
  price: p.price,
  final_price: p.final_price,
  effective_discount: p.effective_discount,
});

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [flash, setFlash] = useState(null);
  // The most recent add, so "your slip" can print that line in and lift the dish (nonce re-triggers on repeat adds).
  const [lastAdded, setLastAdded] = useState(null);
  const timer = useRef();

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const api = useMemo(() => {
    const add = (product, qty = 1) => {
      setItems((cur) => {
        const found = cur.find((i) => i.id === product.id);
        if (found) return cur.map((i) => (i.id === product.id ? { ...i, ...snapshot(product), quantity: Math.min(99, i.quantity + qty) } : i));
        return [...cur, { ...snapshot(product), quantity: qty }];
      });
      setLastAdded({ id: product.id, nonce: Date.now() });
      setFlash(`${product.name} به فیش شما اضافه شد`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setFlash(null), 1800);
    };
    const setQty = (id, qty) =>
      setItems((cur) => (qty < 1 ? cur.filter((i) => i.id !== id) : cur.map((i) => (i.id === id ? { ...i, quantity: Math.min(99, qty) } : i))));
    const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id));
    const clear = () => setItems([]);
    /** Sync with the latest product list: update prices, drop items that are no longer sold. */
    const refresh = (products) =>
      setItems((cur) =>
        cur.flatMap((i) => {
          const p = products.find((x) => x.id === i.id);
          return p ? [{ ...i, ...snapshot(p) }] : [];
        }),
      );
    return { add, setQty, remove, clear, refresh };
  }, []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = items.reduce((s, i) => s + i.final_price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, total, savings: subtotal - total, flash, lastAdded, ...api }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
