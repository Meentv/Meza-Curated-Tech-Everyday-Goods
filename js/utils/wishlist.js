/* ==========================================================================
   wishlist.js — same pattern as cart.js: pure logic over localStorage.
   Storage shape:  meza:v1:wishlist = [productId, …]
   ========================================================================== */

import { read, write, storageKey } from './storage.js';
import { getProductById } from '../data/products.js';

export const WISHLIST_EVENT = 'meza:wishlist-change';
const KEY = 'wishlist';

function load() {
  const raw = read(KEY, []);
  return Array.isArray(raw) ? raw.filter((id) => getProductById(id)) : [];
}

function save(list) {
  write(KEY, list);
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT));
}

/** Wishlisted products as full product objects, in the order they were saved. */
export const getWishlist = () => load().map((id) => getProductById(id)).filter(Boolean);
export const getWishlistCount = () => load().length;
export const isWished = (id) => load().includes(id);

/** Returns { ok, wished } — wished=true means it was ADDED by this call. */
export function toggleWishlist(id) {
  if (!getProductById(id)) return { ok: false };
  const list = load();
  const i = list.indexOf(id);
  if (i >= 0) { list.splice(i, 1); save(list); return { ok: true, wished: false }; }
  list.push(id); save(list);
  return { ok: true, wished: true };
}

export function removeFromWishlist(id) {
  const list = load();
  const i = list.indexOf(id);
  if (i >= 0) { list.splice(i, 1); save(list); }
}

export function onWishlistChange(fn) {
  window.addEventListener(WISHLIST_EVENT, fn);
  window.addEventListener('storage', (e) => { if (e.key === storageKey(KEY)) fn(); });
}
