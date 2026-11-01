/* ==========================================================================
   cart.js — cart state + money math. Pure logic over localStorage, no DOM,
   so it is unit-tested in Node with a localStorage mock (tests/).

   Storage shape:  meza:v1:cart = { [productId]: qty }     (no variants in v1)
   Change events:  a CustomEvent 'meza:cart-change' on window lets the navbar
                   badges re-render; the 'storage' event syncs across tabs.
   ========================================================================== */

import { read, write, remove, storageKey } from './storage.js';
import { getProductById } from '../data/products.js';

export const MAX_QTY = 10; // per line item — a demo has no stock counts, so a fixed cap
export const CART_EVENT = 'meza:cart-change';

/* Demo shipping rule (simulated — documented in README "Simulated
   functionality"). Single source for the navbar announcement + checkout. */
export const SHIPPING_RULE = { flatFee: 2500, freeAbove: 150000 };
export const shippingFor = (subtotal) =>
  subtotal >= SHIPPING_RULE.freeAbove ? 0 : SHIPPING_RULE.flatFee;

const KEY = 'cart';

/** Read + sanitize: drop unknown ids, clamp qty into 1..MAX_QTY. */
function load() {
  const raw = read(KEY, {});
  const clean = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [id, qty] of Object.entries(raw)) {
      const q = Number.parseInt(qty, 10);
      if (getProductById(id) && Number.isInteger(q)) clean[id] = Math.min(Math.max(q, 1), MAX_QTY);
    }
  }
  return clean;
}

function save(cart) {
  write(KEY, cart);
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

/** [{ product, qty }] for every known product in the cart. */
export function getCartEntries() {
  return Object.entries(load())
    .map(([id, qty]) => ({ product: getProductById(id), qty }))
    .filter((e) => e.product);
}

export const getCartCount = () => getCartEntries().reduce((n, e) => n + e.qty, 0);

/** Only AVAILABLE items are charged — out-of-stock lines are flagged, not billed. */
export function getSubtotal() {
  return getCartEntries()
    .filter((e) => e.product.availability === 'in-stock')
    .reduce((sum, e) => sum + e.product.price * e.qty, 0);
}

export const getUnavailableEntries = () =>
  getCartEntries().filter((e) => e.product.availability !== 'in-stock');

export const isInCart = (id) => id in load();

/** Returns { ok, reason? } — callers turn 'unavailable' into a toast. */
export function addToCart(id, qty = 1) {
  const product = getProductById(id);
  if (!product) return { ok: false, reason: 'unknown-product' };
  if (product.availability !== 'in-stock') return { ok: false, reason: 'unavailable' };
  const cart = load();
  cart[id] = Math.min((cart[id] ?? 0) + qty, MAX_QTY);
  save(cart);
  return { ok: true, qty: cart[id] };
}

/** qty <= 0 removes the line; anything above MAX_QTY is clamped. */
export function setQty(id, qty) {
  const cart = load();
  if (!(id in cart)) return;
  const q = Math.round(Number(qty));
  if (!Number.isFinite(q) || q <= 0) delete cart[id];
  else cart[id] = Math.min(q, MAX_QTY);
  save(cart);
}

export function removeFromCart(id) {
  const cart = load();
  if (id in cart) { delete cart[id]; save(cart); }
}

export function clearCart() {
  remove(KEY);
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

/** Subscribe to cart changes (own tab + other tabs). */
export function onCartChange(fn) {
  window.addEventListener(CART_EVENT, fn);
  window.addEventListener('storage', (e) => { if (e.key === storageKey(KEY)) fn(); });
}
