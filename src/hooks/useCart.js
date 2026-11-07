import { useEffect, useState } from 'react';
import {
  getCartEntries,
  getCartCount,
  getSubtotal,
  shippingFor,
  onCartChange,
} from '../lib/cart.js';

/** The cart entries, kept in sync with localStorage (this tab and others). */
export function useCartEntries() {
  const [entries, setEntries] = useState(getCartEntries);
  useEffect(() => onCartChange(() => setEntries(getCartEntries())), []);
  return entries;
}

/** Total item count — used by the navbar badge. */
export function useCartCount() {
  const [count, setCount] = useState(getCartCount);
  useEffect(() => onCartChange(() => setCount(getCartCount())), []);
  return count;
}

/** Entries + count + money math for the cart and checkout pages. */
export function useCartSummary() {
  const entries = useCartEntries();
  const count = entries.reduce((n, e) => n + e.qty, 0);
  const subtotal = getSubtotal();
  const hasItems = entries.length > 0;
  const shipping = hasItems ? shippingFor(subtotal) : 0;
  return { entries, count, subtotal, shipping, total: subtotal + shipping, hasItems };
}
