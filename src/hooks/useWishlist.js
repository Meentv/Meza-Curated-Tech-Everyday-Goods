import { useEffect, useState } from 'react';
import { getWishlist, getWishlistCount, onWishlistChange } from '../lib/wishlist.js';

/** Saved products as full product objects, in the order they were saved. */
export function useWishlist() {
  const [items, setItems] = useState(getWishlist);
  useEffect(() => onWishlistChange(() => setItems(getWishlist())), []);
  return items;
}

/** Saved item count — used by the navbar badge. */
export function useWishlistCount() {
  const [count, setCount] = useState(getWishlistCount);
  useEffect(() => onWishlistChange(() => setCount(getWishlistCount())), []);
  return count;
}
