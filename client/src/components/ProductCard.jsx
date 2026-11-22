import { useEffect, useState } from 'react';
import { useCart } from '../lib/cart.jsx';
import { formatMoney, formatNumber } from '../lib/format.js';
import { DrumstickIcon, MinusIcon, PlusIcon } from './Icons.jsx';

/** Red rubber stamp: only used where something changed (a live discount, an added dish). */
export function DiscountBadge({ percent, className = 'stamp' }) {
  return <span className={className}>{formatNumber(percent)}٪ تخفیف</span>;
}

/** Discounts are marked on the price itself: the old price struck in red, the stamp beside the new one. */
export function Price({ product }) {
  return (
    <span className="price">
      {product.discount_active && <DiscountBadge percent={product.effective_discount} />}
      <span className="price__now">{formatMoney(product.final_price)}</span>
      {product.discount_active && (
        <s className="price__old"><span className="sr-only">قیمت قبلی: </span>{formatMoney(product.price)}</s>
      )}
    </span>
  );
}

/** "+" until the dish is on your slip, then an LED quantity stepper. */
export function AddControl({ product }) {
  const { items, add, setQty } = useCart();
  const line = items.find((i) => i.id === product.id);
  if (!line)
    return (
      <button className="add" onClick={() => add(product)} aria-label={`افزودن ${product.name} به فیش`}>
        <PlusIcon width={22} height={22} strokeWidth={2.6} />
      </button>
    );
  return (
    <span className="stepper" role="group" aria-label={`تعداد ${product.name}`}>
      <button onClick={() => add(product)} aria-label="یکی بیشتر"><PlusIcon width={18} /></button>
      <span className="led" aria-live="polite">{formatNumber(line.quantity)}</span>
      <button onClick={() => setQty(product.id, line.quantity - 1)} aria-label="یکی کمتر"><MinusIcon width={18} /></button>
    </span>
  );
}

/** The one row every dish uses, on every page (one ruler for the whole menu). */
export default function SlipRow({ product }) {
  const { lastAdded } = useCart();
  // The dish you just added lifts forward for a moment; everything else stays still.
  const [lifted, setLifted] = useState(false);
  useEffect(() => {
    if (lastAdded?.id !== product.id) return;
    setLifted(true);
    const t = setTimeout(() => setLifted(false), 700);
    return () => clearTimeout(t);
  }, [lastAdded, product.id]);
  return (
    <li className={`srow ${lifted ? 'is-lifted' : ''}`}>
      {product.image ? (
        <img className="srow__img" src={product.image} alt="" loading="lazy" width="76" height="76" />
      ) : (
        <span className="srow__img srow__img--ph"><DrumstickIcon width={30} height={30} /></span>
      )}
      <div className="srow__info">
        <h3 className="srow__name">{product.name}</h3>
        {product.description && <p className="srow__desc">{product.description}</p>}
      </div>
      <div className="srow__end">
        <Price product={product} />
        <AddControl product={product} />
      </div>
    </li>
  );
}
